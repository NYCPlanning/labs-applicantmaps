import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import turfBbox from 'npm:@turf/bbox';


export default class ProjectIndexController extends Controller {
  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  }

  projectAreaLayer = {
    "id": "project-area-line",
    "type": "line",
    "layout": {
      "visibility": "visible",
      "line-cap": "round"
    },
    "paint": {
      "line-width": 6,
      "line-dasharray": [
        0.1,
        2
      ]
    }
  }

  @action
  handleMapLoad(projectArea, map) {
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 10,
    });

  }
}
