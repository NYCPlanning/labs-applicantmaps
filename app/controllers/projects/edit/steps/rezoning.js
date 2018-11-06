import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class RezoningController extends Controller {
  @computed('model.needRezoning', 'model.needUnderlyingZoning', 'model.needCommercialOverlay', 'model.needSpecialDistrict')
  get hasAnsweredAll() {
    if ((this.get('model.needRezoning') === true) && (this.get('model.needUnderlyingZoning') != null) && (this.get('model.needCommercialOverlay') != null) && (this.get('model.needSpecialDistrict') != null)) return true;

    return false;
  }

  @computed('model.needRezoning', 'model.needUnderlyingZoning', 'model.needCommercialOverlay', 'model.needSpecialDistrict')
  get firstGeomType() {
    if ((this.get('model.needRezoning') === true) && (this.get('model.needUnderlyingZoning') === true)) return 'rezoning-underlying';
    if ((this.get('model.needRezoning') === true) && (this.get('model.needCommercialOverlay') === true)) return 'rezoning-commercial';
    if ((this.get('model.needRezoning') === true) && (this.get('model.needSpecialDistrict') === true)) return 'rezoning-special';

    return false;
  }
}
