import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import projectGeomLayers from '../utils/project-geom-layers';

const selectedLotsLayer = {
  type: 'fill',
  paint: {
    'fill-color': 'rgba(217, 216, 1, 1)',
    'fill-outline-color': 'rgba(255, 255, 255, 1)',
  },
};

@tagName('')
export default class ProjectFormComponent extends Component {
  constructor(...args) {
    super(...args);
    this.set('selectedLots', {
      type: 'FeatureCollection',
      features: [],
    });
  }

  @argument
  model;

  @service
  notificationMessages;

  @service
  router;

  projectGeomLayers = projectGeomLayers

  selectedLotsLayer = selectedLotsLayer

  lotSelectionMode = false

  isSelectingLots = false

  geocodedFeature = null;

  geocodedLayer = {
    type: 'circle',
    paint: {
      'circle-radius': {
        stops: [
          [
            10,
            5,
          ],
          [
            17,
            12,
          ],
        ],
      },
      'circle-color': 'rgba(199, 92, 92, 1)',
      'circle-stroke-width': {
        stops: [
          [
            10,
            20,
          ],
          [
            17,
            18,
          ],
        ],
      },
      'circle-stroke-color': 'rgba(65, 73, 255, 1)',
      'circle-opacity': 0,
      'circle-stroke-opacity': 0.2,
    },
  }

  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
  }

  @computed('selectedLots.features.[]')
  get selectedLotsSource() {
    const selectedLots = this.get('selectedLots');
    return {
      type: 'geojson',
      data: selectedLots,
    };
  }

  @action
  selectSearchResult({ geometry }) {
    const { coordinates } = geometry;
    const { mapInstance: map } = this;

    this.set('geocodedFeature', { type: 'geojson', data: geometry });
    map.flyTo({ center: coordinates, zoom: 16 });
  }

  @action
  handleSearchClear() {
    this.set('searchedAddressSource', null);
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();

    map.addControl(navigationControl, 'top-left');
  }

  @action
  handleLayerClick(feature) {
    const { id: layerId } = feature.layer;

    // if lot was clicked when in lot selection mode, handle the clicl
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

  @action
  async save(model) {
    const project = await model.save();

    this.get('notificationMessages').success('Project saved!');

    this.get('router').transitionTo('projects.show', project);
  }

  @action
  flyTo(center, zoom) {
    // Fly to the lot
    this.get('mapInstance').flyTo({ center, zoom });
    // Turn on the Tax Lots layer group
    this.set('tax-lots', true);
  }
}
