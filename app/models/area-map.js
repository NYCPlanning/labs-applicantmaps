import { computed } from '@ember-decorators/object';
import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import { attr } from '@ember-decorators/data';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import ApplicantMap from './applicant-map';

export default class extends ApplicantMap {
  @attr('string', { defaultValue: 'Area Map' })
  mapTypeLabel;

  @attr('string', { defaultValue: '600' })
  bufferSize;

  // union all geometries together, draw a 600 foot buffer around the union
  @computed('bufferSize')
  get projectGeometryBuffer() {
    const featureCollections = this.getProperties('project.developmentSite', 'project.projectArea', 'project.rezoningArea');
    const bufferSize = this.get('bufferSize');
    const bufferSizeMiles = bufferSize * 0.000189394;

    const flattenedFeatureCollection = Object.values(featureCollections)
      .filter(feature => !isEmpty(feature))
      .reduce((newFeatureCollection, { features }) => {
        newFeatureCollection.features = newFeatureCollection.features.concat(features);

        return newFeatureCollection;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    const projectGeometryUnion = flattenedFeatureCollection.features
      .reduce((union, feature) => {
        if (feature) {
          if (union === null) {
            union = feature;
          } else {
            union = turfUnion(union, feature);
          }
        }

        return union;
      }, null);

    return turfBuffer(projectGeometryUnion, bufferSizeMiles, { units: 'miles' });
  }
}
