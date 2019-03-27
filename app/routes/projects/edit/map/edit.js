import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';

export default class ProjectsEditMapRoute extends Route {
  @service
  notificationMessages;

  model({ mapType = 'area-map' }) {
    const project = this.modelFor('projects.edit');
    const keyForLookup = pluralize(camelize(mapType));

    return project.get(`${keyForLookup}.firstObject`)
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
