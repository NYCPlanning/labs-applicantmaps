import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import turfBbox from 'npm:@turf/bbox';

import areaMapLegendConfig from '../../../../utils/area-map-legend-config';

export default class NewProjectMapController extends Controller {
  queryParams = ['mapType'];

  areaMapLegendConfig = areaMapLegendConfig;

  @action
  handleMapLoaded(map) {
    this.set('mapInstance', map);
    const buffer = this.get('model.project.projectGeometryBuffer');

    map.fitBounds(turfBbox.default(buffer), {
      padding: 50,
      duration: 0,
    });

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
      // 'highway_name_other',
      // 'highway_name_motorway',
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

    this.handleMapRotateOrPitch();
    this.updateBounds();
  }
}
