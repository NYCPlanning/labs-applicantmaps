import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import turfBuffer from '@turf/buffer';
import turfUnion from '@turf/union';
import turfSimplify from '@turf/simplify';
import MapboxDraw from 'mapbox-gl-draw';
import carto from 'cartobox-promises-utility/utils/carto';
import { task } from 'ember-concurrency-decorators';

const tolerance = 0.000001;
const plutoTable = 'mappluto_v18_1';

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});

export const selectedLotsLayer = {
  type: 'fill',
  paint: {
    'fill-color': 'rgba(217, 216, 1, 1)',
    'fill-outline-color': 'rgba(255, 255, 255, 1)',
  },
};

export default class DrawLotsToUnion extends Component {
  constructor(...args) {
    super(...args);

    // selectedLots
    this.set('selectedLots', {
      type: 'FeatureCollection',
      features: [],
    });
  }

  init(...args) {
    super.init(...args);
    const { mapInstance } = this.get('map');
    const mode = this.get('mode');
    const geometricProperty = this.get('geometricProperty');

    mapInstance.addControl(draw, 'top-left');
    if (mode === 'draw') {
      draw.changeMode('draw_polygon');

      // if geometry exists for this mode, add it to the drawing canvas
      if (geometricProperty) {
        draw.add(geometricProperty);
        draw.changeMode('simple_select');
      }
    }
  }

  @argument
  geometricProperty;

  @argument
  map;

  @argument
  mode;

  @service
  store;

  lotSelectionMode = true;

  selectedLotsLayer = selectedLotsLayer;

  @computed()
  get taxLots() {
    return this.get('store').peekRecord('layer-group', 'tax-lots');
  }

  @computed('selectedLots.features.[]')
  get selectedLotsSource() {
    const selectedLots = this.get('selectedLots');
    return {
      type: 'geojson',
      data: selectedLots,
    };
  }

  @computed('selectedLots.features.@each.geometry')
  get selectedLotsBuffer() {
    const { features } = this.get('selectedLots');
    const [{ geometry }] = features;
    const { length } = features;
    const bufferkm = 0.00008;

    let union = turfBuffer(geometry, bufferkm);

    if (length > 1) {
      for (let i = 1; i < length; i += 1) {
        const bufferedGeometry = turfBuffer(features[i].geometry, bufferkm);

        union = turfUnion(union, bufferedGeometry);
      }
    }

    union = turfSimplify(union, { tolerance });

    return {
      type: 'FeatureCollection',
      features: [union],
    };
  }

  @task
  hydrateFeatures = function* (feature) {
    const { properties } = feature;
    const targetFeature = this.get('selectedLots.features')
      .find(({ properties: { bbl } }) => bbl === properties.bbl);
    console.log(targetFeature);

    const bblSelectionQuery = `SELECT the_geom FROM ${plutoTable} WHERE bbl = ${properties.bbl}`;
    const { features: [{ geometry }] } = yield carto.SQL(bblSelectionQuery, 'geojson');
    Ember.set(targetFeature, 'geometry', geometry);
    return geometry;
  }

  @action
  handleLayerClick(feature) {
    const { layer: { id: layerId } } = feature;

    // if lot was clicked when in lot selection mode, handle the click
    if (layerId === 'pluto-fill') {
      const { properties } = feature; // geometry is fragment
      const selectedLots = this.get('selectedLots');

      // if the lot is not in the selection, push it, if it is, remove it
      const inSelection = selectedLots
        .features
        .find(lot => lot.properties.bbl === properties.bbl);

      if (inSelection === undefined) {
        this.get('selectedLots.features')
          .pushObject(feature);
        this.get('hydrateFeatures').perform(feature); // task to fetch full feature;
      } else {
        const newLots = selectedLots
          .features
          .filter(lot => lot.properties.bbl !== properties.bbl);

        this.set('selectedLots.features', newLots);
      }
    }
  }

  @action
  noop() {}

  @computed('mode', 'selectedLotsBuffer')
  get finalGeometry() {
    const bufferedLots = this.get('selectedLotsBuffer');
    const drawnGeometry = draw.getAll();
    const finalGeometry = (this.get('mode') === 'lots') ? bufferedLots : drawnGeometry;
    const { features: [{ geometry }] } = finalGeometry;

    return geometry;
  }

  willDestroyElement(...args) {
    super.willDestroyElement(...args);

    const { mapInstance } = this.get('map');

    // drawing cleanup
    draw.trash();
    draw.deleteAll();
    mapInstance.off('draw.selectionchange');
    mapInstance.removeControl(draw);
  }
}
