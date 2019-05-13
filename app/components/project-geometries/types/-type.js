import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default class TypeBaseClass extends Component {
  @service
  currentMode;

  willDestroyElement(...args) {
    const { componentInstance: { draw } } = this.get('currentMode');
    if (draw) draw.deleteAll();

    super.willDestroyElement(...args);

    this.set('isReady', false);
  }
}
