import Controller from '@ember/controller';

export default class GeometryEditController extends Controller {
  queryParams = ['mode', 'type'];

  type = null;

  mode = null;

  // a cache of the layerGroups
  layerGroups = null;
}
