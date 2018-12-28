import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { EmptyFeatureCollection } from '../../models/project';
import projectGeometryIcons from '../../utils/project-geom-icons';


export default class ShowProjectController extends Controller {
  EmptyFeatureCollection = EmptyFeatureCollection;

  projectGeometryIcons = projectGeometryIcons;

  @action
  handleMapLoad(map) {
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
