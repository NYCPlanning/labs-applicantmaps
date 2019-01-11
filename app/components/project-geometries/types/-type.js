import Component from '@ember/component';
import { service } from '@ember-decorators/service';

export default class TypeBaseClass extends Component {
  @service
  currentMode;

  willDestroyElement(...args) {
    const { componentInstance: { draw } } = this.get('currentMode');
    if (draw) draw.deleteAll();

    super.willDestroyElement(...args);
  }
}
