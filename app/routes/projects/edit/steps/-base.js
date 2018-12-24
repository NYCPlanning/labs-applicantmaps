import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';

export default class StepsBaseRoute extends Route {
  // always save the model when transition out of a step
  @action
  willTransition() {
    const model = this.modelFor('projects.edit');
    model.save();
  }
}
