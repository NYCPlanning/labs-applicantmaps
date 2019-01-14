import { Promise } from 'rsvp';
import MapboxGl from 'mapbox-gl';
import QUnit from 'qunit';

export default function createMap(container = document.createElement('div')) {
  return new Promise((resolve) => {
    Object.defineProperty(container, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });

    // Sinon.stub(MapboxGl.Map.prototype, '_detectMissingCSS');

    const map = new MapboxGl.Map({
      container,
      // interactive: false,
      attributionControl: false,
      trackResize: true,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
    });

    map.on('load', () => resolve(map));

    const onErr = (data) => {
      QUnit.onUnhandledRejection((data && data.error) || data || 'Empty error event from mapbox-gl-js');
    };

    map.style.on('error', onErr);
    map.on('error', onErr);
  });
}
