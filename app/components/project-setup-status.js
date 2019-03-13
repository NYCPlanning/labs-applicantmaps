import Component from '@ember/component';
import { inject as service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

export default class ProjectSetupStatus extends Component {
  // // @argument
  project;

  @service
  notificationMessages;

  @action
  async save(field, value) {
    const project = this.get('project');
    project.set(field, value);

    try {
      await project.save();
      this.get('notificationMessages').success('Project saved!');
    } catch (e) {
      this.get('notificationMessages').error(`Something went wrong: ${e}`);
    }
  }
}
