import Route from '@ember/routing/route';

export default class ProjectsNewRoute extends Route {
  model() {
    const project = this.modelFor('projects.edit');

    return this.store.createRecord('applicant-map', { project });
  }

  deactivate() {
    const applicantMap = this.modelFor('projects.edit.map.new');
    applicantMap.rollbackAttributes();
  }
}
