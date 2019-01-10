import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';

export default class AnnotationsRenderer extends Component {
  @argument
  annotations;

  // @computed('annotations')
}
