import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { developmentSiteLayer } from '../../components/project-geometries/development-site';
import { projectAreaLayer } from '../../components/project-geometries/project-area';

export default class NewProjectController extends Controller {
  projectAreaLayer = projectAreaLayer;

  developmentSiteLayer = developmentSiteLayer;

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
