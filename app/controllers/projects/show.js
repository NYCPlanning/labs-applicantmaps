import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { developmentSiteLayer } from '../../components/project-geometries/development-site';
import { projectAreaLayer } from '../../components/project-geometries/project-area';
import areaMapLegendConfig from '../../utils/area-map-legend-config';

export default class NewProjectController extends Controller {
  projectAreaLayer = projectAreaLayer;

  developmentSiteLayer = developmentSiteLayer;

  areaMapLegendConfig = areaMapLegendConfig;

  @action
  handleMapLoad(map) {
    window.map = map;

    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
