import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import { developmentSiteLayer } from './project-geometries/types/development-site';
import { projectAreaLayer } from './project-geometries/types/project-area';

@tagName('')
export default class ProjectGeometryEditComponent extends Component {
  @argument
  model;

  @argument
  type;

  @argument
  mode;

  @service
  notificationMessages;

  @service
  router;

  developmentSiteLayer = developmentSiteLayer;

  projectAreaLayer = projectAreaLayer;

  /* ----------  General Map  ---------- */
  showDrawInstructions = true;

  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
  }

  @computed('type')
  get projectGeometryType() {
    return `project-geometries/types/${this.get('type')}`;
  }

  @action
  hideInstructions() {
    this.set('showDrawInstructions', false);
  }

  @action
  showInstructions() {
    this.set('showDrawInstructions', true);
  }

  @action
  rollbackChanges() {
    this.get('model').rollbackAttributes();
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    map.addControl(navigationControl, 'top-left');

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 150,
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
}
