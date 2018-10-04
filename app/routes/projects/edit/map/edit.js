import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class ProjectsEditMapRoute extends Route {
  @service
  notificationMessages;

  model({ map_id }) {
    return this.modelFor('projects.edit').get('applicantMaps').findBy('id', map_id);
  }

  deactivate() {
    const applicantMap = this.modelFor('projects.edit.map.edit');
    applicantMap.rollbackAttributes();
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
