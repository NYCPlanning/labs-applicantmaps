import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default Controller.extend({
  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  },

  @action
  handleMapLoad(map) {
    window.map = map;
  }
});
