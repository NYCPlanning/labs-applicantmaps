import Route from '@ember/routing/route';

export default class ProjectsEditRoute extends Route {
  model() {
    const sources = this.store.peekAll('source');
    return sources.toArray().uniqBy('meta.description');
  }
}
