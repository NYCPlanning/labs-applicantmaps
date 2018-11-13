import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import turfBuffer from '@turf/buffer';
import turfUnion from '@turf/union';
import turfSimplify from '@turf/simplify';
import MapboxDraw from 'mapbox-gl-draw';

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
  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @service
  store;

  @computed()
  get taxLots() {
    return this.get('store').peekRecord('layer-group', 'tax-lots');
  }

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
    const model = this.get('model');
    const mode = this.get('mode');

    mapInstance.addControl(draw, 'top-left');
    if (mode === 'draw') {
      draw.changeMode('draw_polygon');

      // if geometry exists for this mode, add it to the drawing canvas
      if (model.get('developmentSite')) {
        draw.add(model.get('developmentSite'));
        draw.changeMode('simple_select');
      }
    }
  }


  lotSelectionMode = true;

  selectedLotsLayer = selectedLotsLayer;

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
    const selectedLots = this.get('selectedLots');
    const bufferkm = 0.00008;

    let union = turfBuffer(selectedLots.features[0].geometry, bufferkm);

    if (selectedLots.features.length > 1) {
      for (let i = 1; i < selectedLots.features.length; i += 1) {
        const bufferedGeometry = turfBuffer(selectedLots.features[i].geometry, bufferkm);

        union = turfUnion(union, bufferedGeometry);
      }
    }

    union = turfSimplify(union, { tolerance: 0.000001 });

    return {
      type: 'FeatureCollection',
      features: [union],
    };
  }

  @action
  handleLayerClick(feature) {
    const { layer: { id: layerId } } = feature;

    // if lot was clicked when in lot selection mode, handle the click
    if (layerId === 'pluto-fill') {
      const { type, geometry, properties } = feature;
      const selectedLots = this.get('selectedLots');

      // if the lot is not in the selection, push it, if it is, remove it
      const inSelection = selectedLots.features.find(lot => lot.properties.bbl === properties.bbl);

      if (inSelection === undefined) {
        this.get('selectedLots.features').pushObject({
          type,
          geometry,
          properties,
        });
      } else {
        const newLots = selectedLots.features.filter(lot => lot.properties.bbl !== properties.bbl);
        this.set('selectedLots.features', newLots);
      }
    }
  }

  @action
  noop() {}

  @computed('mode', 'selectedLotsBuffer')
  get finalGeometry() {
    const finalGeometry = (this.get('mode') === 'lots') ? this.get('selectedLotsBuffer') : draw.getAll();
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
