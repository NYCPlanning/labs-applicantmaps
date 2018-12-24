import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { run } from '@ember/runloop';

export default class ProjectSetupStatus extends Component {
  @argument
  project;

  @argument
  shareURL = window.location.href;

  @action
  handleShareSuccess() {
    this.set('copySuccess', true);
    run.later(() => {
      this.set('copySuccess', false);
    }, 2000);
  }

  @action
  handleShareError() {
    this.set('copyError', true);
    run.later(() => {
      this.set('copyError', false);
    }, 2000);
  }
}
