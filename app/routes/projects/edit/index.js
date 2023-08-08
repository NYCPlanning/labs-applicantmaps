import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ProjectsEditRoute extends Route {
  @service
  notifications;

  model() {
    return this.modelFor('projects.edit');
  }

  @action
  error({ message }) {
    this.get('notifications').error(message);
    this.transitionTo('application');
  }
}
