import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class NewProjectMapController extends Controller {
  @action
  async save(model) {
    const map = await model.save()
    
    this.transitionToRoute('projects.edit.map.edit', map);
  }
}
