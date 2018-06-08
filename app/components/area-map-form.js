import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';
import turfBbox from 'npm:@turf/bbox';

export default class AreaMapFormComponent extends Component {
  @computed('model.applicantMap.projectArea')
  get projectAreaSource() {
    const projectArea = this.get('model.applicantMap.projectArea');
    return projectArea
  }

  @computed('projectAreaSource')
  get projectBufferSource() {
    const projectArea = this.get('projectAreaSource').data;
    return {
      type: 'geojson',
      data: turfBuffer(projectArea, 0.5, {units: 'miles'})
    }
  }

  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  }

  // TODO for some reason I have to pass in the projectArea instead
  // of just calling this.get('projectAreaSource') ('this' is not available in the action)
  @action
  handleMapLoad(projectArea, map) {
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 300,
    });

  }
}
