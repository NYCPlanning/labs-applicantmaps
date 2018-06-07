import Route from '@ember/routing/route';

export default class NewProjectRoute extends Route {
  model() {
    return this.store.createRecord('project');
  }
}
