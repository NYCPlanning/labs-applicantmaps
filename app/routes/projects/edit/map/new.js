import Route from '@ember/routing/route';

export default class ProjectsNewRoute extends Route {
  model({ type = 'area-map' }) {
    const project = this.modelFor('projects.edit');

    return this.store.createRecord(type, { project });
  }

  deactivate() {
    const applicantMap = this.modelFor('projects.edit.map.new');
    applicantMap.rollbackAttributes();
  }
}
