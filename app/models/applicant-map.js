import DS from 'ember-data';
import { attr, belongsTo } from '@ember-decorators/data';

const { Model } = DS;

/*
  Abstract base class for applicant maps. Specific types
  can be found under ./maps
*/
export default class ApplicantMapModel extends Model.extend({}) {
  // area, tax, zoning change, zoning section
  @attr('string') type;

  @attr() toggledLayers;

  @attr() center;

  @belongsTo('project', { inverse: 'applicantMaps' }) project;
}
