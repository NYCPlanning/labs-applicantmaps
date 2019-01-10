import DS from 'ember-data';
import { attr, belongsTo } from '@ember-decorators/data';
import {
  type,
  oneOf,
  arrayOf,
  shapeOf,
  unionOf,
  optional,
} from '@ember-decorators/argument/type';
import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { EmptyFeatureCollection } from 'labs-applicant-maps/models/project';
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

const Feature = shapeOf({
  // TODO
  // id: unionOf(Number, String),
  type: oneOf('Feature'),
  geometry: unionOf(Object, null),
  properties: optional(Object),
});

export const FeatureCollection = shapeOf({
  type: oneOf('FeatureCollection'),
  features: arrayOf(
    Feature,
  ),
});

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

  @alias('project.annotations')
  annotations;

  @computed('proposedGeometry', 'canonical', 'annotations')
  get data() {
    const { proposedGeometry, annotations } = this;

    return {
      type: 'FeatureCollection',
      features: [
        ...annotations.features
          .filterBy('geometry'),
        ...proposedGeometry.features
          .filterBy('geometry'),
      ],
    };
  }

  set data(featureCollection) {
    const proposedGeometry = {
      type: 'FeatureCollection',
      features: featureCollection.features
        .filterBy('properties.meta:mode', 'draw')
        .filterBy('geometry'), // need non-null geoms only, mapbox-gl-draw bug
    };

    const annotations = {
      type: 'FeatureCollection',
      features: featureCollection.features
        .filterBy('properties.meta:mode', 'draw/annotation')
        .filterBy('geometry'), // need non-null geoms only, mapbox-gl-draw bug
    };

    this.setProperties({
      proposedGeometry,
      annotations,
    });
  }

  async setCanonical(...args) {
    const query = queries[this.get('geometryType')];
    const developmentSite = this.get('project.developmentSite');
    const result = await query(developmentSite, this.get('project.geometricProperties'), ...args);

    await this.setProperties({
      proposedGeometry: result,
      hasCanonical: true,
      canonical: result,
    });
  }
}
