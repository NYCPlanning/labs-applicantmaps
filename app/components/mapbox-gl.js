import MapboxGlComponent from 'ember-mapbox-gl/components/mapbox-gl';

import { assign } from '@ember/polyfills';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { bind } from '@ember/runloop';
import MapboxGl from 'mapbox-gl';

export default class ExtendedMapboxGlComponent extends MapboxGlComponent {
  _setup() {
    const mbglConfig = getOwner(this).resolveRegistration('config:environment')['mapbox-gl'];
    const options = assign({}, mbglConfig.map, get(this, 'initOptions'));
    options.container = this.element;

    if (window.FakeXMLHttpRequest) {
      options.transformRequest = (url) => {
        window.XMLHttpRequest = window.XMLHttpRequestNative;
        return { url };
      }
    }

    const map = new MapboxGl.Map(options);
    map.once('load', bind(this, this._onLoad, map));
  }
}
