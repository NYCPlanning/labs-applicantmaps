import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';


export default class DrawControlController extends Component {
  @argument
  projectGeometryMode

  @argument
  lotSelectionMode

  @argument
  mode

  @argument
  modeDisplayName

  @argument
  projectGeometryMode

  @argument
  toggleGeometryEditing

  @argument
  startLotSelection

  @argument
  finishLotSelection

  @argument
  setProjectGeometry

  @action
  toggleGeometryEditing(type) {
    this.get('toggleGeometryEditing')(type);
  }

  @action
  startLotSelection() {
    this.get('startLotSelection')();
  }

  @action
  finishLotSelection() {
    this.get('finishLotSelection')();
  }

  @action
  setProjectGeometry() {
    this.get('setProjectGeometry')();
  }
}
