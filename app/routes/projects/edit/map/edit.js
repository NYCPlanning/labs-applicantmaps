import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';

export default class ProjectsEditMapRoute extends Route {
  @service
  notifications;

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
    this.get('notifications').error(message);
    this.transitionTo('application');
  }
}
