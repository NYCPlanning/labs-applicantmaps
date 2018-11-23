import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';

export default class GeometryEditRoute extends Route {
  @action
  willTransition() {
    const model = this.modelFor('projects.edit');

    if (model.hasDirtyAttributes) {
      model.rollbackAttributes();
    }
  }
}
