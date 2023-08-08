import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RouteClass extends Route {
  @service
  notifications;

  @action
  error({ message }) {
    this.get('notifications').error(message);
    this.transitionTo('application');
  }
}
