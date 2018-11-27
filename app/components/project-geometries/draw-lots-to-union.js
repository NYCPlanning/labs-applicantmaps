import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class DrawLotsToUnion extends Component {
  @argument
  geometricProperty;

  @argument
  map;

  @argument
  mode;

  // validate the existence of properties
  @computed('geometricProperty')
  get isValid() {
    return !!this.get('geometricProperty');
  }

  // make sure no rehydration tasks are still running
  @computed('isValid')
  get isReady() {
    return this.get('isValid');
  }

  @computed('mode', 'selectedLotsBuffer', 'geometricProperty')
  get finalGeometry() {
    const bufferedLots = this.get('selectedLotsBuffer');
    const drawnGeometry = this.get('geometricProperty');
    const finalGeometry = (this.get('mode') === 'lots') ? bufferedLots : drawnGeometry;

    return finalGeometry;
  }

  @action
  noop() {}
}
