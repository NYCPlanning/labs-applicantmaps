import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';
import turfUnion from 'npm:@turf/union';

const { Model } = DS;

const requiredFields = [
  'projectName',
  'applicantName',
  'developmentSite',
  'projectArea',
  'description',
];

export default class ProjectModel extends Model.extend({}) {
  @hasMany('applicant-map', { polymorphic: true, async: false }) applicantMaps;

  @attr({
    defaultValue() {
      return {
        type: 'Point',
        coordinates: [-73.983307, 40.704977],
      };
    },
  }) projectArea; // geojson

  @attr() developmentSite

  @attr() rezoningArea

  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  @computed(...requiredFields)
  get isValid() {
    return requiredFields.every(field => this.get(field));
  }

  @computed('projectArea')
  get projectAreaSource() {
    const projectArea = this.get('projectArea');
    return {
      type: 'geojson',
      data: projectArea,
    };
  }

  // union all geometries together, draw a 600 foot buffer around the union
  @computed('projectAreaSource')
  get projectGeometryBufferSource() {
    const developmentSite = this.get('developmentSite');
    const projectArea = this.get('projectArea');
    const rezoningArea = this.get('rezoningArea');

    let union = null;

    [developmentSite, projectArea, rezoningArea].forEach((geometry) => {
      if (geometry) {
        if (union === null) {
          union = geometry;
        } else {
          union = turfUnion.default(union, geometry);
        }
      }
    });

    return {
      type: 'geojson',
      data: turfBuffer(union, 0.113636, { units: 'miles' }),
    };
  }
}
