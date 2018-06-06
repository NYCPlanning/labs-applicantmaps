import Route from '@ember/routing/route';

export default class ProjectsEditIndexRoute extends Route {
  model() {
    const { id } = this.paramsFor('projects.edit');
    return this.store.peekRecord('project', id, { include: 'applicant-maps' });
  }
}
