import Controller from '@ember/controller';
import { computed, action } from '@ember-decorators/object';

export default class RezoningController extends Controller {
  @computed('model.needRezoning', 'model.needUnderlyingZoning', 'model.needCommercialOverlay', 'model.needSpecialDistrict')
  get hasAnsweredAll() {
    if ((this.get('model.needRezoning') === true) && (this.get('model.needUnderlyingZoning') != null) && (this.get('model.needCommercialOverlay') != null) && (this.get('model.needSpecialDistrict') != null)) return true;

    return false;
  }

  @computed('hasAnsweredAll', 'model.needUnderlyingZoning', 'model.needCommercialOverlay', 'model.needSpecialDistrict')
  get hasAnsweredLogically() {
    if (this.get('hasAnsweredAll') && (this.get('model.needUnderlyingZoning') || this.get('model.needCommercialOverlay') || this.get('model.needSpecialDistrict'))) return true;
    if (this.get('hasAnsweredAll')) return false;
    return null;
  }

  @computed('model.needRezoning', 'model.needUnderlyingZoning', 'model.needCommercialOverlay', 'model.needSpecialDistrict')
  get firstGeomType() {
    if ((this.get('model.needRezoning') === true) && (this.get('model.needUnderlyingZoning') === true)) return 'rezoning-underlying';
    if ((this.get('model.needRezoning') === true) && (this.get('model.needCommercialOverlay') === true)) return 'rezoning-commercial';
    if ((this.get('model.needRezoning') === true) && (this.get('model.needSpecialDistrict') === true)) return 'rezoning-special';

    return false;
  }

  @action
  setRezoningFalse() {
    this.set('model.needRezoning', false);
    this.set('model.needUnderlyingZoning', null);
    this.set('model.needCommercialOverlay', null);
    this.set('model.needSpecialDistrict', null);
  }
}
