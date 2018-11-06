import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

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

  @service
  store;

  @argument
  map;

  @argument
  model;

  lotSelectionMode = true

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

  developmentSiteLayer = developmentSiteLayer;

  selectedLotsLayer = selectedLotsLayer;

  geometryMode = null;

  @action
  handleLayerClick(feature) {
    const { layer: { id: layerId } } = feature;

    // if lot was clicked when in lot selection mode, handle the click
    if (layerId === 'pluto-fill' && this.get('lotSelectionMode')) {
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
        this.set('selectedLots.features', selectedLots.features.filter(lot => lot.properties.bbl !== properties.bbl));
      }
    }
  }
}
