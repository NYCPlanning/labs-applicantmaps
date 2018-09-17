import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';

export default class DummyAreaController extends Controller{

  projectAreaSource = {
    type: 'geojson',
    data: {
      "type": "Polygon",
      "coordinates": [
        [
          [
            -73.96291136741638,
            40.71262619918462
          ],
          [
            -73.96314203739166,
            40.712260242111675
          ],
          [
            -73.9628255367279,
            40.71214638838985
          ],
          [
            -73.96259486675262,
            40.71251641227394
          ],
          [
            -73.96291136741638,
            40.71262619918462
          ]
        ]
      ]
    }
  }

  @computed('projectAreaSource')
  get projectBufferSource() {
    const projectArea = this.get('projectAreaSource').data;
    return {
      type: 'geojson',
      data: turfBuffer(projectArea, 0.5, {units: 'miles'})
    }
  }

  @action
  handleMapLoad(map) {
    window.map = map;
  }
}
