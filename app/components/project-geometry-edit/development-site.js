import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
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
  // styles: drawStyles, TODO modify default draw styles
});

export const developmentSiteLayer = {
  id: 'development-site-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(237, 18, 18, 1)',
    'line-width': 4.5,
    'line-dasharray': [2.5, 1, 1, 1],
  },
};

export const selectedLotsLayer = {
  type: 'fill',
  paint: {
    'fill-color': 'rgba(217, 216, 1, 1)',
    'fill-outline-color': 'rgba(255, 255, 255, 1)',
  },
};

export default class DevelopmentSiteComponent extends Component {
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

  @service
  store;

  @service
  router;

  @service
  notificationMessages;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  lotSelectionMode = true;

  developmentSiteLayer = developmentSiteLayer;

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
    if (layerId === 'pluto-fill' && this.get('mode') === 'lots') {
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
  async save() {
    const model = this.get('model');
    // runs when user is done selecting lots
    // adds a small buffer to all lots to ensure the union will be contiguous
    // unions all lots together into one feature
    // TODO simplify the resulting union to get rid of curved corners with many vertices
    // this.set('lotSelectionMode', false);

    // if mode is lots, computed its buffer
    if (this.get('mode') === 'lots') {
      const buffer = this.get('selectedLotsBuffer');

      // clear selected features
      this.set('selectedLots.features', []);

      const { features: [{ geometry }] } = buffer;
      console.log(geometry);
      model.set('developmentSite', geometry);
    }

    // if mode is draw, use the gl-draw feature collection
    if (this.get('mode') === 'draw') {
      const FeatureCollection = draw.getAll();
      const { geometry } = FeatureCollection.features[0];
      model.set('developmentSite', geometry);

      // delete the drawn geometry
      draw.deleteAll();
    }

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }

  willDestroyElement(...args) {
    super.willDestroyElement(...args);

    const { mapInstance } = this.get('map');

    draw.trash();
    mapInstance.off('draw.selectionchange');
    mapInstance.removeControl(draw);
  }
}
