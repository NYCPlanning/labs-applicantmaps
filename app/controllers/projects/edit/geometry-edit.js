import Controller from '@ember/controller';

export default class GeometryEditController extends Controller {
  queryParams = ['mode', 'type', 'target'];

  type = null;

  mode = null;

  target = 'proposedGeometry';
}
