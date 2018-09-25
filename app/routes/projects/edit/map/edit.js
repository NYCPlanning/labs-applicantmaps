import Route from '@ember/routing/route';

export default class ProjectsEditMapRoute extends Route {
  model({ map_id }) {
    return this.modelFor('projects.edit').get('applicantMaps').findBy('id', map_id);
  }
}
