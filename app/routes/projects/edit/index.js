import Route from '@ember/routing/route';

export default class ProjectsEditIndexRoute extends Route {
  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  }

  model() {
    return this.modelFor('projects.edit');
  }
}
