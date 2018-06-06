import Route from '@ember/routing/route';

export default class ProjectsEditMapRoute extends Route {
  model({ map_id }) {
    console.log(map_id);
    return this.store.peekRecord('applicant-map', map_id);
  }
}
