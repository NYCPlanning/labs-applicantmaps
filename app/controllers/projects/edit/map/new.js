import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class NewProjectMapController extends Controller {
  @service
  notificationMessages;


  @action
  async save(model) {
    const map = await model.save();

    this.get('notificationMessages').success('Map added!');
    
    this.transitionToRoute('projects.edit.map.edit', map);
  }
}
