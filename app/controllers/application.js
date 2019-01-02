import { action } from '@ember-decorators/object';
import Controller from '@ember/controller';
import mapboxgl from 'mapbox-gl';

export default class ApplicationController extends Controller {
  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    const geoLocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });

    map.addControl(navigationControl, 'top-left');
    map.addControl(geoLocateControl, 'top-left');
  }
}
