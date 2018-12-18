import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { run } from '@ember/runloop';

export default class ProjectSetupStatus extends Component {
  @argument
  project;

  @action
  handleShareSuccess() {
    this.set('copySuccess', true);
    run.later(() => {
      this.set('copySuccess', false);
    }, 2000);
  }

  @action
  handleModalClose() {
    this.set('copySuccess', false);
  }
}
