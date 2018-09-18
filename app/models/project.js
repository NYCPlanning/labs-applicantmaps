import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';

const { Model } = DS;

const requiredFields = [
  'projectName',
  'applicantName',
  'projectArea',
  'zapProjectId',
  'description',
];

export default class ProjectModel extends Model.extend({}) {
  @hasMany('applicant-map', { polymorphic: true }) applicantMaps;

  @attr({ 
    defaultValue() {
      return {
        type: 'Point',
        coordinates: [-73.983307, 40.704977],
      }
    }
  }) projectArea; // geojson

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
    }
  }

  @computed('projectAreaSource')
  get projectBufferSource() {
    const { data } = this.get('projectAreaSource');
    return {
      type: 'geojson',
      data: turfBuffer(data, 0.113636, { units: 'miles' })
    };
  }
}
