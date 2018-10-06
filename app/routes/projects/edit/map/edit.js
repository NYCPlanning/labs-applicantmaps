import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { camelize } from '@ember/string';

export default class ProjectsEditMapRoute extends Route {
  @service
  notificationMessages;

  model({ mapType = 'area-map' }) {
    const project = this.modelFor('projects.edit');

    return project.get(`${camelize(mapType)}.firstObject`)
      || this.store.createRecord(mapType, { project });
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
