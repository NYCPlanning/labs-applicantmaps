import Component from '@ember/component';
import { action } from '@ember/object';
import mapboxgl from 'mapbox-gl';
import { tagName } from '@ember-decorators/component';

// it:
// renders the map
// sets up a drawable map
// invokes the types-/mode-renderer with drawable map
export default
@tagName('')
class ProjectGeometryEditComponent extends Component {
  // required
  // // @argument
  model;

  // required
  // // @argument
  type;

  // required
  // // @argument
  mode;

  // required
  // // @argument
  layerGroups;

  /* ----------  General Map  ---------- */
  @action
  handleMapLoad(map) {
    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    map.addControl(navigationControl, 'top-left');

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 120,
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
