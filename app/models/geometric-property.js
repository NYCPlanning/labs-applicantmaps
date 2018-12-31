import DS from 'ember-data';
import { attr, belongsTo } from '@ember-decorators/data';
import { type, oneOf } from '@ember-decorators/argument/type';
import { FeatureCollection, EmptyFeatureCollection } from './project';

const { Model } = DS;

const GEOMETRY_TYPES = [
  'developmentSite',
  'projectArea',
  'underlyingZoning',
  'commercialOverlays',
  'specialPurposeDistricts',
];

export default class extends Model {
  @belongsTo('project')
  project;

  @type(oneOf(...GEOMETRY_TYPES))
  @attr('string')
  geometryType;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  proposedGeometry;

  @attr('string')
  queryName;

  @attr('boolean')
  hasCanonical

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  canonical;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  annotations;
}
