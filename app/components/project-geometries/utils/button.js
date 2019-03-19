import Component from '@ember/component';
import { tagName, attribute, classNames } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default
@tagName('button')
@classNames('button large expanded project-save-button')
class DrawLotsButtonComponent extends Component.extend({
    'data-test-project-geometry-save': true,
  }) {
  @attribute
  @computed('enabled')
  get disabled() {
    return !this.get('enabled');
  }

  @argument
  enabled = true;

  @attribute
  type = 'button';

  @argument
  handleClick = () => {};

  click() {
    this.handleClick();
  }
}
