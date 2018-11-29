import Route from '@ember/routing/route';
import { set } from '@ember/object';

export default class StepsBaseRoute extends Route {
  beforeModel() {
    const model = this.modelFor('projects.edit');
    const routeName = this.get('routeName').split('.').reverse()[0];
    const hasVisitedStep = model.get('hasVisitedStep');

    set(hasVisitedStep, routeName, true);

    model.set('hasVisitedStep', hasVisitedStep);
  }
}
