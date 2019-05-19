import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

/*
  Abstract base class for applicant maps.
*/
export default class ApplicantMapModel extends Model {
  // area, tax, zoning change, zoning section
  @attr('string') type;

  @attr('string', { defaultValue: 'landscape' }) paperOrientation;

  @attr('string', { defaultValue: 'tabloid' }) paperSize;

  @attr('number', { defaultValue: 0 }) mapBearing;

  @attr() boundsPolygon;

  @attr() toggledLayers;

  @attr() mapCenter;

  @attr('number') mapZoom;

  @belongsTo('project') project;
}
