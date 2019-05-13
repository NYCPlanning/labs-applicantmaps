import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

const userFacingSteps = ['development-site', 'project-area', 'rezoning', 'complete'];

export default class StepsController extends Controller {
  @service
  router;

  /**
   * 'currentStepNumber' is used only to correctly display the user's progress through
   * actionable, user-facing steps in the projects/edit/steps template
   * 1 - creating development site
   * 2 - creating project area
   * 3 - creating rezoing (underlying, commercial overlay, and special purpose)
   * 4 - wizard complete (requires button click, so is a "step")
   */
  @computed('router.currentRouteName')
  get currentStepNumber() {
    const currentRouteName = this.get('router.currentRouteName');
    const currentStepName = currentRouteName.split('.').slice(-1)[0];

    return userFacingSteps.indexOf(currentStepName) + 1;
  }
}
