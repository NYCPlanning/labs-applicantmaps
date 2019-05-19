import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class DevelopmentSiteController extends Controller {
  @action
  async saveProject() {
    const model = this.get('model');
    await model.save();
    this.get('notificationMessages').success('Map saved to project!');
  }
}
