import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import config from '../../config/environment';

const { mapTypes } = config;

export default class ProjectsEditRoute extends Route {
  @service
  notificationMessages;

  model({ id }) {
    return this.store.findRecord('project', id, { include: mapTypes.toString() });
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
