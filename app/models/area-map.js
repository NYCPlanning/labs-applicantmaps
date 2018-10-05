import { computed } from '@ember-decorators/object';
import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import ApplicantMap from './applicant-map';

export default class extends ApplicantMap {
  mapTypeLabel = 'Area Map';

  bufferSize = '600';

  // union all geometries together, draw a 600 foot buffer around the union
  @computed('bufferSize')
  get projectGeometryBuffer() {
    const geometries = this.getProperties('project.developmentSite', 'project.projectArea', 'project.rezoningArea');
    const bufferSize = this.get('bufferSize');
    const bufferSizeMiles = bufferSize * 0.000189394;

    const projectGeometryUnion = Object.values(geometries).reduce((union, geometry) => {
      if (geometry) {
        if (union === null) {
          union = geometry;
        } else {
          union = turfUnion(union, geometry);
        }
      }

      return union;
    }, null);

    return turfBuffer(projectGeometryUnion, bufferSizeMiles, { units: 'miles' });
  }
}
