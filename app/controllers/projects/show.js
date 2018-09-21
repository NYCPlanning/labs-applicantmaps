import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import projectGeomLayers from '../../utils/project-geom-layers';

export default class NewProjectController extends Controller {
  projectGeomLayers = projectGeomLayers

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
