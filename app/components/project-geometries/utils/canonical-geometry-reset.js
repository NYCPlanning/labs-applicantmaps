import Component from '@ember/component';
import { action } from '@ember/object';

export default class CanonicalGeometryReset extends Component {
  // @argument
  model;

  @action
  resetCanonical() {
    this.model.setCanonical();
  }
}
