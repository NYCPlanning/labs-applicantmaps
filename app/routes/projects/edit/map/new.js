import Route from '@ember/routing/route';

export default class ProjectsNewRoute extends Route {
  model() {
    const project = this.modelFor('projects.edit');
    return this.store.createRecord('map', { project });
  }
}
