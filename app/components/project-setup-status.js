import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ProjectSetupStatus extends Component {
  // // @argument
  project;

  @service
  notifications;

  @action
  async save(field, value) {
    const project = this.get('project');
    project.set(field, value);

    try {
      await project.save();
      this.get('notifications').success('Project saved!');
    } catch (e) {
      this.get('notifications').error(`Something went wrong: ${e}`);
    }
  }
}
