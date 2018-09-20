import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';

import projectGeomLayers from '../../utils/project-geom-layers';

const selectedLotsLayer = {
  type: 'fill',
  paint: {
    'fill-color': 'rgba(217, 216, 1, 1)',
    'fill-outline-color': 'rgba(255, 255, 255, 1)',
  },
};

export default class NewProjectController extends Controller {
  constructor(...args) {
    super(...args);
    this.set('selectedLots', {
      type: 'FeatureCollection',
      features: [],
    });
  }

  projectGeomLayers = projectGeomLayers

  selectedLotsLayer = selectedLotsLayer

  lotSelectionMode = false

  @service notificationMessages;

  projectGeometryMode = null

  isSelectingLots = false

  @computed('selectedLots.features.[]')
  get selectedLotsSource() {
    const selectedLots = this.get('selectedLots');
    return {
      type: 'geojson',
      data: selectedLots,
    };
  }

  @action
  handleSearchSelect(result) {
    const map = this.get('mapInstance');

    // handle address search results
    if (result.type === 'lot') {
      const center = result.geometry.coordinates;
      this.set('searchedAddressSource', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: result.geometry,
        },
      });

      if (map) {
        map.flyTo({
          center,
          zoom: 15,
        });
      }
    }
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

    this.transitionToRoute('projects.edit', project);
  }
}
