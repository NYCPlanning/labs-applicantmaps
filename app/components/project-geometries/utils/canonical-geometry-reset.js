import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class CanonicalGeometryReset extends Component {
  @argument
  model;

  @action
  resetCanonical() {
    this.model.setCanonical();
  }
}
