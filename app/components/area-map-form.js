import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';

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

  @action
  handleMapLoad(map) {
    window.map = map;
  }
}
