import DS from 'ember-data';
import { attr, belongsTo } from '@ember-decorators/data';

const { Model } = DS;

/*
  Abstract base class for applicant maps. Specific types
  can be found under ./maps
*/
export default class extends Model {
  // area, tax, zoning change, zoning section
  @attr('string') type;

  @attr('string', { defaultValue: 'landscape' }) paperOrientation;

  @attr('string', { defaultValue: 'tabloid' }) paperSize;

  @attr('string') type;

  @attr() mapBearing;

  @attr() boundsPolygon;

  @attr() toggledLayers;

  @attr() center;

  @belongsTo('project') project;
}
