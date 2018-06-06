import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';

export default class EditRoute extends Route {
  model({ id }) {
    return this.store.findRecord('project', id, { include: 'applicant-maps' });
  }

  @action
  error(error) {
    console.log(error);
    this.transitionTo('application');
  }
}
