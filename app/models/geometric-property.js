import DS from 'ember-data';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { EmptyFeatureCollection } from 'labs-applicant-maps/models/project';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
import length from '@turf/length';
import { roundLength } from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/mode';
import underlyingZoning from '../utils/queries/intersecting-zoning-query';
import commercialOverlays from '../utils/queries/proposed-commercial-overlays-query';
import specialPurposeDistricts from '../utils/queries/proposed-special-districts-query';
import rezoningArea from '../utils/queries/rezoning-area-query';

const { Model, attr, belongsTo } = DS;

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

/*
 * Checks that, if there are new polygons of given geometricProperty type,
 * all of them have labels
 */
export function newPolygonsHaveLabels(geometricPropertyForType) {
  const [
    _initial, // eslint-disable-line
    proposed,
  ] = geometricPropertyForType.changedAttributes().proposedGeometry || [];

  if (proposed) {
    const polygonWithoutLabel = proposed.features.find(feature => !feature.properties.label);

    if (polygonWithoutLabel) return false;
  }

  return true;
}

// returns true or false based on whether the change to the geometric
// property was "meaningful", or a change to the `proposedGeometry` attr
// that is:
//  a) different from canonical, which it has a canonical change
//  b) different from what was there before, if it exists (a true geometric difference)
// first argument is a geometric-property model
// todo: I think there are two separate handling here, one for
// canonical geometries, one for regular
export function isMeaningfulChange(geometricPropertyForType /* model */) {
  // here, it gets set once by the constructor
  // const initial = model.get(attribute);
  const [
    initial,
    proposed, // upstream proposed should always be FC
  ] = geometricPropertyForType.changedAttributes().proposedGeometry || [];

  // "initial" means whatever is currently proposed. If it's _not_ empty and
  // the geometric property doesn't have something canonical to compare,
  // it should return true

  if (!isEmpty(initial) && !geometricPropertyForType.get('hasCanonical')) return true;

  // only apply this check if this is a canonical geometric prop
  if (geometricPropertyForType.get('hasCanonical')) {
    // check that proposed is not the canonical zoning
    if ((!initial || isEmpty(initial)) && proposed) {
      return isFeatureCollectionChanged(geometricPropertyForType.get('canonical'), proposed);
    }

    // if there is already initial, check that it's non-canonical
    if (!isEmpty(geometricPropertyForType.get('proposedGeometry'))
      && geometricPropertyForType.get('proposedDiffersFromCanonical')) {
      return true;
    }
  }

  // if nothing has been proposed at all, no
  // meaningful changes detected
  if (!proposed) return false;

  // check for FC-ish empties
  if (isEmpty(initial) && !isEmpty(proposed)) return true;

  // finally, if the proposed is not empty, and it's a meaningful
  // change in the feature collection, proceed
  return !isEmpty(geometricPropertyForType.get('proposedGeometry'))
    && isFeatureCollectionChanged(initial, proposed);
}

export default class GeometricPropertyModel extends Model {
  @belongsTo('project')
  project;

  @attr('string')
  geometryType;

  @attr({ defaultValue: () => EmptyFeatureCollection })
  proposedGeometry;

  @alias('proposedGeometry.features.firstObject.properties.isEmptyDefault')
  proposedGeometryIsEmptyDefault;

  @computed('canonical', 'proposedGeometry', 'annotations', 'data')
  get isReadyToProceed() {
    let ready = isMeaningfulChange(this);

    /*
     * Check that proposed polygons have labels for rezoning geometries.
     * NOT enforced for development site or project area
     */
    if (!['developmentSite', 'projectArea'].includes(this.geometryType)) {
      ready = ready && newPolygonsHaveLabels(this);
    }
    return ready;
  }

  @computed('canonical', 'proposedGeometry', 'hasDirtyAttributes')
  get proposedDiffersFromCanonical() {
    return isFeatureCollectionChanged(this.get('canonical'), this.get('proposedGeometry'));
  }

  @attr('string')
  queryName;

  @attr('boolean', { defaultValue: false })
  hasCanonical;

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

    annotations.features.forEach((annotationFeature) => {
      const mode = annotationFeature.properties['meta:mode'];

      if ((mode === 'draw_annotations:linear') || (mode === 'draw_annotations:curved')) {
        annotationFeature.properties.label = `${roundLength((length(annotationFeature.geometry) * 3280.8).toFixed(1))} ft`;
      }
    });

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
