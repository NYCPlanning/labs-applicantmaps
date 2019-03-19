import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class CompleteController extends Controller {
  @service
  router;

  @action
  async goToProjectDashboard() {
    const model = this.get('model');
    // satisfy conditions to complete this step
    model.set('hasCompletedWizard', true);
    // transition to dashboard view
    this.get('router').transitionTo('projects.show', model);
  }
}
