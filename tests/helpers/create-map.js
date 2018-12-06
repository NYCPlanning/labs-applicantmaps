import { Promise } from 'rsvp';
import MapboxGl from 'mapbox-gl';
import QUnit from 'qunit';
import Config from '../../config/environment';

export default function createMap(container = document.createElement('div')) {
  return new Promise((resolve) => {
    const map = new MapboxGl.Map({
      container,
      style: Config['mapbox-gl'].map.style,
    });

    map.style.once('data', () => resolve(map));

    const onErr = (data) => {
      QUnit.onUnhandledRejection((data && data.error) || data || 'Empty error event from mapbox-gl-js');
    };

    map.style.on('error', onErr);
    map.on('error', onErr);
  });
}
