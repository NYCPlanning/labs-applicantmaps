import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class ProjectsEditRoute extends Route {
  @service
  notificationMessages;

  model({ id }) {
    return this.store.findRecord('project', id, { include: 'applicant-maps' });
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
