import Route from '@ember/routing/route';

export default class GeometryEditRoute extends Route {
  queryParams = {
    mode: { replace: true },
    type: { replace: true },
    target: { replace: true },
  };
}
