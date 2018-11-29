import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import config from '../../config/environment';

const { mapTypes } = config;

export default class ProjectsShowRoute extends Route {
  @service
  notificationMessages;

  model({ project_id }) {
    return this.store.findRecord('project', project_id, { include: mapTypes.toString() });
  }

  afterModel(model) {
    // here we check which step we're on so that we can route
    const { routing: { route, mode, type } } = model.get('currentStep');

    // has the user completed the steps? if not, transition to that step.
    if (model.get('currentStep') !== 'complete') {
      this.transitionTo(route, model.get('id'), { queryParams: { mode, type } });
    }
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
