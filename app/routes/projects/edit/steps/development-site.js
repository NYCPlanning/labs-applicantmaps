import StepRoute from './-base';

export default class DevelopmentSiteRoute extends StepRoute {
  afterModel(model) {
    model.set('needDevelopmentSite', true);
  }
}
