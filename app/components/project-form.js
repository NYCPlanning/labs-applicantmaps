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

  geometryMode = null

  @service
  router;

  projectGeomLayers = projectGeomLayers

  selectedLotsLayer = selectedLotsLayer

  lotSelectionMode = false

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

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 50,
        duration: 0,
      });
    }

    const basemapLayersToHide = [
      'highway_path',
      'highway_minor',
      'highway_major_casing',
      'highway_major_inner',
      'highway_major_subtle',
      'highway_motorway_casing',
      'highway_motorway_inner',
      'highway_motorway_subtle',
      'highway_motorway_bridge_casing',
      'highway_motorway_bridge_inner',
      'highway_name_other',
      'highway_name_motorway',
      'tunnel_motorway_casing',
      'tunnel_motorway_inner',
      'railway_transit',
      'railway_transit_dashline',
      'railway_service',
      'railway_service_dashline',
      'railway',
      'railway_dashline',
    ];

    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
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
}
