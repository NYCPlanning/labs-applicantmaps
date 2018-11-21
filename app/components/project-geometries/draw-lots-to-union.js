import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import turfBuffer from '@turf/buffer';
import turfUnion from '@turf/union';
import turfSimplify from '@turf/simplify';
import { set } from '@ember/object';
import MapboxDraw from 'mapbox-gl-draw';
import carto from 'cartobox-promises-utility/utils/carto';
import { task } from 'ember-concurrency-decorators';
import { waitForProperty } from 'ember-concurrency';

const tolerance = 0.000001;
const bufferkm = 0.00008;
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

    const { mapInstance } = this.get('map');
    const mode = this.get('mode');
    const geometricProperty = this.get('geometricProperty');

    if (mode === 'draw') {
      mapInstance.addControl(draw, 'top-left');

      // set up initial drawing mode
      draw.changeMode('draw_polygon');

      // if geometry exists for this mode, add it to the drawing canvas
      if (geometricProperty) {
        this.set('currentDrawing', geometricProperty);
        draw.add(geometricProperty);
        draw.changeMode('simple_select');
      }

      const drawStateCallback = () => {
        this.set('currentDrawing', draw.getAll());
        this.set('drawMode', draw.getMode());

        const selectedFeatures = draw.getSelected().features;
        if (selectedFeatures.length === 1) {
          this.set('selectedFeature', selectedFeatures[0]);
        } else {
          this.set('selectedFeature', undefined);
        }
      };

      // setup events to update draw state
      // bind events to the state callback
      ['create', 'delete', 'combine', 'uncombine', 'update', 'selectionchange', 'modechange']
        .forEach((event) => {
          mapInstance.on(`draw.${event}`, drawStateCallback);
        });
    }
  }

  @argument
  geometricProperty;

  @argument
  map;

  @argument
  mode;

  @argument
  editableLabel = false;

  @service
  store;

  lotSelectionMode = true;

  selectedLotsLayer = selectedLotsLayer;

  currentDrawing = null;

  drawMode = null;

  selectedFeature = undefined;

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
    if (!features.length) return {};
    const [{ geometry }] = features;
    const { length } = features;

    return waitForProperty(this, 'hydrateFeatures.isIdle')
      .then(() => {
        // TODO: this should only begin unioning if hydrateFeatures isIdle
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
      });
  }

  // Hydrate geometric fragments with true lot data
  @task
  hydrateFeatures = function* (feature) {
    const { properties } = feature;
    const targetFeature = this.get('selectedLots.features')
      .find(({ properties: { bbl } }) => bbl === properties.bbl);
    const bblSelectionQuery = `SELECT the_geom FROM ${plutoTable} WHERE bbl = ${properties.bbl}`;
    const { features: [{ geometry }] } = yield carto.SQL(bblSelectionQuery, 'geojson');

    set(targetFeature, 'geometry', geometry);
  }

  // Custom Draw button
  @action
  handleDrawButtonClick() {
    draw.changeMode('draw_polygon');
    this.set('drawMode', draw.getMode());
  }

  // Custom Trash button
  @action
  handleTrashButtonClick() {
    draw.trash();
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
  updateSelectedFeature(label) {
    const id = this.get('selectedFeature.id');
    draw.setFeatureProperty(id, 'label', label);
  }

  // validate the existence of properties
  @computed('mode', 'currentDrawing', 'selectedLots.features.length')
  get isValid() {
    const { mode, currentDrawing, selectedLots } = this.getProperties('mode', 'currentDrawing', 'selectedLots');
    // button is disabled if mode is not draw and there are no selected features
    return (mode === 'draw') ? (!!currentDrawing) : (selectedLots.features.length);
  }

  // make sure no rehydration tasks are still running
  @computed('isValid', 'hydrateFeatures.isIdle')
  get isReady() {
    return this.get('isValid') && this.get('hydrateFeatures.isIdle');
  }

  @computed('mode', 'selectedLotsBuffer', 'currentDrawing')
  get finalGeometry() {
    const bufferedLots = this.get('selectedLotsBuffer');
    const drawnGeometry = this.get('currentDrawing');
    const finalGeometry = (this.get('mode') === 'lots') ? bufferedLots : drawnGeometry;

    return finalGeometry;
  }

  @action
  noop() {}

  willDestroyElement(...args) {
    super.willDestroyElement(...args);

    const { mapInstance } = this.get('map');

    if (this.get('mode') === 'draw') {
      // drawing cleanup
      draw.trash();
      draw.deleteAll();
      mapInstance.off('draw.selectionchange');
      mapInstance.removeControl(draw);
    }
  }
}
