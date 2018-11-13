import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';

export default class ProjectSetupStatus extends Component {
  @argument
  project;

  @action
  async updateProjectName() {
    // const model = this.get('model');
    // await model.save();
    // this.get('notificationMessages').success('Project name updated!');
  }

  @action
  async updateApplicantName() {
    // const model = this.get('model');
    // await model.save();
    // this.get('notificationMessages').success('Applicant updated!');
  }

  @action
  async updateZapProjectId() {
    // const model = this.get('model');
    // await model.save();
    // this.get('notificationMessages').success('Project number updated!');
  }
}
