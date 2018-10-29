import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default Controller.extend({
  @action
  async saveProject() {
    const model = this.get('model');
    await model.save();
    this.get('notificationMessages').success('Map saved to project!');
  },
});
