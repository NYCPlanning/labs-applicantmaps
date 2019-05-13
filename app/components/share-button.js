import Component from '@ember/component';
import { action } from '@ember/object';
import { run } from '@ember/runloop';

export default class ShareButtonComponent extends Component {
  // // @argument
  project;

  // // @argument
  label='project';

  // // @argument
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
