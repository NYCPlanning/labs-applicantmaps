import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
