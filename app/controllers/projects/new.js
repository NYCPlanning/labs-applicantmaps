import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from 'mapbox-gl-draw';

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  // styles: drawStyles, TODO modify default draw styles
});

export default class NewProjectController extends Controller {
  isDrawing = false;
  drawMode = null;

  @computed('model.projectArea')
  get projectAreaSource() {
    const data = this.get('model.projectArea');
    return {
      type: 'geojson',
      data,
    }
  }

  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;

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

  @action
  handleDrawButtonClick() {
    const isDrawing = this.get('isDrawing');
    const map = this.get('mapInstance');
    if (isDrawing) {
     draw.trash();
     this.set('isDrawing', false);
     this.set('drawMode', null);
    } else {
     map.addControl(draw, 'top-right');

     draw.changeMode('draw_polygon');

     this.set('isDrawing', true);
    }
  }

  @action
  setProjectArea(e) {
    console.log(e)
    // delete the drawn geometry
    draw.deleteAll();

    const { geometry } = e.features[0];

    console.log(geometry)
    this.set('model.projectArea', geometry)
  }

  @action
  async save(model) {
    const project = await model.save()

    this.transitionToRoute('projects.edit', project);
  }
}
