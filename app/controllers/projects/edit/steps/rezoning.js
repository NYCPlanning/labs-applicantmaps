import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class RezoningController extends Controller {
  @action
  setRezoningFalse() {
    this.set('model.needRezoning', false);
    this.set('model.needUnderlyingZoning', null);
    this.set('model.needCommercialOverlay', null);
    this.set('model.needSpecialDistrict', null);
  }
}
