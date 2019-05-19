import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import config from '../../config/environment';

const { mapTypes } = config;

export default class ProjectsEditRoute extends Route {
  @service
  notificationMessages;

  model({ project_id }) {
    const include = ['geometric-properties', ...mapTypes].toString();

    return this.store.findRecord('project', project_id, { include });
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
