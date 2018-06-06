import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';

export default class EditRoute extends Route {
  model({ id }) {
    return this.store.findRecord('project', id);
  }

  @action
  error() {
    this.transitionTo('application');
  }
}
