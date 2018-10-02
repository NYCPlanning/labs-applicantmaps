import Route from '@ember/routing/route';

export default class ProjectsNewRoute extends Route {
  model({ mapType }) {
    const project = this.modelFor('projects.edit');

    return this.store.createRecord(mapType, { project });
  }
  
  afterModel(model) {
    model.reload();
  }

  deactivate() {
    const applicantMap = this.modelFor('projects.edit.map.new');
    applicantMap.rollbackAttributes();
  }
}
