import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class DrawLotsToUnion extends Component {
  @argument
  geometricProperty;

  @argument
  map;

  @argument
  mode;
}
