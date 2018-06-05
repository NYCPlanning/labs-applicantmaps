import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { hasMany } from '@ember-decorators/data';

const { Model } = DS;

export default class ProjectModel extends Model {
  @hasMany('applicant-map') applicantMaps;

  @attr() projectArea; // geojson
  @attr('string') projectName;
  @attr('string') applicantName;
  @attr('number') projectID;
  @attr('number', { defaultValue: 0 }) datePrepared;
}
