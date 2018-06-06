import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default Controller.extend({
  @action
  async save(model) {
    const project = await model.save()
    
    this.transitionToRoute('projects.edit', project);
  }
});
