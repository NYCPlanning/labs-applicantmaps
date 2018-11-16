import Component from '@ember/component';
import { tagName, attribute, classNames } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

@tagName('button')
@classNames('button large green expanded project-save-button')
export default class DrawLotsButtonComponent extends Component {
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
  finalGeometry;

  @argument
  handleClick = () => {};

  click() {
    this.handleClick(this.get('finalGeometry'));
  }
}
