import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default Controller.extend({

  @action
  handleMapLoad(map) {
    window.map = map;
  }
});
