import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class RezoningController extends Controller {
  @action
  setRezoningFalse() {
    this.get('model').setRezoningFalse();
  }
}
