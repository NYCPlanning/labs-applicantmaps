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
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
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

// returns true or false based on whether the change to the geometric
// property was "meaningful"
// first argument is a geometric-property model
export function isMeaningfulChange(geometricPropertyForType /* model */) {
  // here, it gets set once by the constructor
  // const initial = model.get(attribute);
  const [
    initial,
    proposed, // upstream proposed should always be FC
  ] = geometricPropertyForType.changedAttributes().proposedGeometry || [];

  // if nothing has been proposed at all, no
  // meaningful changes detected
  if (!proposed) return false;

  // only apply this check if this is a canonical geometric prop
  if (geometricPropertyForType.get('hasCanonical')) {
    // check that proposed is not the canonical zoning
    if ((!initial || isEmpty(initial)) && proposed) {
      return isFeatureCollectionChanged(geometricPropertyForType.get('canonical'), proposed);
    }
  }

  // check for FC-ish empties
  if (isEmpty(initial) && !isEmpty(proposed)) return true;

  // finally, if the proposed is not empty, and it's a meaningful
  // change in the feature collection, proceed
  return !isEmpty(geometricPropertyForType.get('proposedGeometry'))
    && isFeatureCollectionChanged(initial, proposed);
}

export default class extends Model {
  @belongsTo('project')
  project;

  @type(oneOf(...GEOMETRY_TYPES))
  @attr('string')
  geometryType;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  proposedGeometry;

  @computed('canonical', 'proposedGeometry', 'annotations', 'data')
  get isReadyToProceed() {
    return isMeaningfulChange(this);
  }

  @computed('canonical', 'proposedGeometry', 'hasDirtyAttributes')
  get proposedDiffersFromCanonical() {
    return isFeatureCollectionChanged(this.get('canonical'), this.get('proposedGeometry'));
  }

  @attr('string')
  queryName;

  @attr('boolean', { defaultValue: false })
  hasCanonical;

  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection })
  canonical;

  @alias('project.annotations')
  annotations;

  // Takes all feature collection data and splits it out
  // into separate properties, geometric and annotations.
  // This splitting happens because downstream rezoning
  // gets affected
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
        .filter(({ properties: { 'meta:mode': mode = '' } }) => !mode.includes('draw_annotations'))
        .filterBy('geometry'), // need non-null geoms only, mapbox-gl-draw bug
    };

    const annotations = {
      type: 'FeatureCollection',
      features: featureCollection.features
        .filter(({ properties: { 'meta:mode': mode = '' } }) => mode.includes('draw_annotations'))
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

    if (isEmpty(result)) {
      // if it's empty, the proposed geometry is the canonical geometry
      this.setProperties({
        hasCanonical: false,
        canonical: this.get('proposedGeometry'),
      });
    } else {
      // otherwise, the canonical geometry is what is received from the server
      this.setProperties({
        proposedGeometry: result,
        hasCanonical: true,
        canonical: result,
      });
    }
  }
}
