import DS from 'ember-data';
import { attr, belongsTo } from '@ember-decorators/data';
import { type, oneOf } from '@ember-decorators/argument/type';
import { next } from '@ember/runloop';
import { FeatureCollection, EmptyFeatureCollection } from './project';
import underlyingZoning from '../utils/queries/intersecting-zoning-query';
import commercialOverlays from '../utils/queries/proposed-commercial-overlays-query';
import specialPurposeDistricts from '../utils/queries/proposed-special-districts-query';
import rezoningArea from '../utils/queries/rezoning-area-query';

const { Model } = DS;

const queries = {
  underlyingZoning,
  commercialOverlays,
  specialPurposeDistricts,
  rezoningArea,
};

export const GEOMETRY_TYPES = [
  'developmentSite',
  'projectArea',
  'underlyingZoning',
  'commercialOverlays',
  'specialPurposeDistricts',
  'rezoningArea',
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

  @attr('boolean', { defaultValue: false })
  hasCanonical;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  canonical;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  annotations;

  async setCanonical(...args) {
    const query = queries[this.get('geometryType')];
    const developmentSite = this.get('project.developmentSite');

    if (!query) return new Error(`query not found for ${this.get('geometryType')}`);

    const result = await query(developmentSite, this.get('project.geometricProperties'), ...args);

    next(() => {
      this.set('proposedGeometry', result);
      this.set('hasCanonical', true);
      this.set('canonical', result);
    });

    return this;
  }
}
