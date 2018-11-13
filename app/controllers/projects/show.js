import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { developmentSiteLayer } from '../../components/project-geometry-edit/development-site';
import { projectAreaLayer } from '../../components/project-geometry-edit/project-area';

export default class NewProjectController extends Controller {
  projectAreaLayer = projectAreaLayer;

  developmentSiteLayer = developmentSiteLayer;

  @action
  handleMapLoad(map) { // eslint-disable-line
    window.map = map;

    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
