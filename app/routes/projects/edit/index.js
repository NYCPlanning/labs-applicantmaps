import Route from '@ember/routing/route';

export default class ProjectsEditIndexRoute extends Route {
  model() {
    return this.modelFor('projects.edit');
  }
}
