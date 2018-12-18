import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

export default class StepsController extends Controller {
  @service
  router;

  @computed('router.currentRouteName')
  get currentStepNumber() {
    const currentRouteName = this.get('router.currentRouteName');

    if (currentRouteName === 'projects.edit.steps.rezoning') { return 3; }
    if (currentRouteName === 'projects.edit.steps.project-area') { return 2; }
    return 1;
  }
}
