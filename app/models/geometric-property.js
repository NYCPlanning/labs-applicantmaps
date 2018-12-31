import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { type, oneOf } from '@ember-decorators/argument/type';
import { FeatureCollection } from './project';

const { Model } = DS;

const GEOMETRY_TYPES = [
  'developmentSite',
  'projectArea',
  'underlyingZoning',
  'commercialOverlays',
  'specialPurposeDistricts',
];

export default class GeometricProperty extends Model {
  @type(oneOf(...GEOMETRY_TYPES))
  @attr('string')
  geometryType;

  @type(FeatureCollection)
  @attr()
  data;

  @attr('string')
  queryName;

  @attr('boolean')
  hasCanonical

  @type(FeatureCollection)
  @attr()
  canonical;

  @type(FeatureCollection)
  @attr()
  annotations;
}
