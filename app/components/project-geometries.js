import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import { developmentSiteLayer } from './project-geometries/types/development-site';
import { projectAreaLayer } from './project-geometries/types/project-area';
import projectGeometryIcons from '../utils/project-geom-icons';

// it:
// renders the map
// sets up a drawable map
// invokes the types-/mode-renderer with drawable map
// and conditionally loads the map legend
@tagName('')
export default class ProjectGeometryEditComponent extends Component {
  // required
  @argument
  model;

  // required
  @argument
  type;

  // required
  @argument
  mode;

  // required
  @argument
  layerGroups;

  @service
  notificationMessages;

  @service store;

  @service
  router;

  projectGeometryIcons = projectGeometryIcons;

  developmentSiteLayer = developmentSiteLayer;

  projectAreaLayer = projectAreaLayer;

  /* ----------  General Map  ---------- */
  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
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
        padding: 50,
        duration: 0,
      });
    }

    const basemapLayersToHide = [
      'highway_path',
      'highway_minor',
      'highway_major_casing',
      'highway_name_other',
      'highway_name_motorway',
      'railway_transit',
      'railway_transit_dashline',
    ];

    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
  }
}
