import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import turfDifference from '@turf/difference';
import { camelize } from '@ember/string';
import carto from 'cartobox-promises-utility/utils/carto';
import {
  type,
  arrayOf,
  shapeOf,
  unionOf,
  optional,
  oneOf,
} from '@ember-decorators/argument/type';
import isEmpty from '../utils/is-empty';
import config from '../config/environment';

const bufferMeters = 500;
const { mapTypes } = config;
const { Model } = DS;

const questionFields = [
  'needProjectArea',
  'needRezoning',
  'needUnderlyingZoning',
  'needCommercialOverlay',
  'needSpecialDistrict',
];

const fieldsForCurrentStep = [
  'developmentSite',
  'projectName',
  'projectArea',
  'rezoningArea',
  'underlyingZoning',
  'commercialOverlays',
  'specialPurposeDistricts',
  ...questionFields,
];

const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {},
  }],
};

const Feature = shapeOf({
  type: oneOf('Feature'),
  geometry: unionOf(Object, null),
  properties: optional(Object),
});

const FeatureCollection = shapeOf({
  type: oneOf('FeatureCollection'),
  features: arrayOf(
    Feature,
  ),
});

export const INTERSECTING_ZONING_QUERY = async (developmentSite) => {
  if (developmentSite) {
    // Get zoning districts
    const zoningQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(zoning.the_geom, buffer.the_geom) AS the_geom, zonedist AS label, cartodb_id AS id
      FROM planninglabs.zoning_districts_v201809 zoning, buffer
      WHERE ST_Intersects(zoning.the_geom,buffer.the_geom)
    `;

    const clippedZoningDistricts = await new carto.SQL(zoningQuery, 'geojson');

    // add an id to the top level of each feature object, for use by mapbox-gl-draw
    const { features } = clippedZoningDistricts;
    clippedZoningDistricts.features = features.map((feature) => {
      feature.id = feature.properties.id;
      return feature;
    });

    return clippedZoningDistricts;
  }

  return null;
};

export const PROPOSED_COMMERCIAL_OVERLAYS_QUERY = (developmentSite) => {
  if (developmentSite) {
    // Get commercial overlays
    const commercialOverlaysQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(co.the_geom, buffer.the_geom) AS the_geom, overlay AS label
      FROM planninglabs.commercial_overlays_v201809 co, buffer
      WHERE ST_Intersects(co.the_geom,buffer.the_geom)
    `;

    return new carto.SQL(commercialOverlaysQuery, 'geojson');
  }

  return null;
};

export const PROPOSE_SPECIAL_DISTRICTS_QUERY = (developmentSite) => {
  if (developmentSite) {
    // Get special purpose districts
    const specialPurposeDistrictsQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(spd.the_geom, buffer.the_geom) AS the_geom, sdname AS label
      FROM planninglabs.special_purpose_districts_v201809 spd, buffer
      WHERE ST_Intersects(spd.the_geom,buffer.the_geom)
    `;

    return new carto.SQL(specialPurposeDistrictsQuery, 'geojson');
  }

  return null;
};

export const REZONING_AREA_QUERY = (currentZoning, proposedZoning) => {
  // create an empty FeatureCollection to hold the difference sections
  const differenceFC = {
    type: 'FeatureCollection',
    features: [],
  };

  // flag differences
  proposedZoning.features.forEach((feature) => {
    const { id } = feature;
    const correspondingCurrentZoningFeature = currentZoning.features.filter(d => d.id === id)[0];

    // if feature exists in currentZoning, compare the geometries
    if (correspondingCurrentZoningFeature) {
      // get the difference
      const difference = turfDifference(correspondingCurrentZoningFeature, feature);
      if (difference) differenceFC.features.push(difference);

      // get the inverse difference (reverse the order of the polygons)
      const inverseDifference = turfDifference(feature, correspondingCurrentZoningFeature);
      if (inverseDifference) differenceFC.features.push(inverseDifference);
    } else {
      differenceFC.features.push(feature);
    }
  });

  // union together all difference features
  if (differenceFC.features.length > 0) {
    const differenceUnion = differenceFC.features
      .reduce((union, { geometry }) => {
        if (union === null) {
          union = geometry;
        } else {
          union = turfUnion(union, geometry);
        }

        const buffered = turfBuffer(union, -0.0005);
        return buffered;
      }, null);

    return differenceUnion;
  }

  return null;
};

const trueOrNull = property => property === true || property === null;

export default class extends Model {
  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @computed(...mapTypes.map(mapType => `${camelize(mapType)}.@each.length`))
  get applicantMaps() {
    const maps = this.getProperties('areaMaps', 'taxMaps', 'zoningChangeMaps', 'zoningSectionMaps');
    return Object.values(maps).reduce((acc, curr) => acc.concat(...curr.toArray()), []);
  }

  // ******** BASIC PROJECT CREATION INFO ********
  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  // ******** REQUIRED ANSWERS ********
  @attr('boolean', { allowNull: true, defaultValue: null }) needProjectArea;

  @attr('boolean', { allowNull: true, defaultValue: null }) needRezoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { allowNull: true, defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  // FeatureCollection of polygons or multipolygons
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) developmentSite

  // FeatureCollection of polygons or multipolygons
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) projectArea

  // FeatureCollection
  // includes label information that must be stored as properties
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) underlyingZoning

  async setDefaultUnderlyingZoning() {
    const developmentSite = this.get('developmentSite');
    const result = await INTERSECTING_ZONING_QUERY(developmentSite);

    this.set('underlyingZoning', result);
  }

  // FeatureCollection
  // includes label information that must be stored as properties
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) commercialOverlays

  async setDefaultCommercialOverlays() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSED_COMMERCIAL_OVERLAYS_QUERY(developmentSite);

    this.set('commercialOverlays', result);
  }

  // FeatureCollection
  // includes label information that must be stored as properties
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) specialPurposeDistricts

  async setDefaultSpecialPurposeDistricts() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSE_SPECIAL_DISTRICTS_QUERY(developmentSite);

    this.set('specialPurposeDistricts', result);
  }

  // FeatureCollection of polygons or multipolygons
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) rezoningArea

  async setRezoningArea() {
    const proposedZoning = this.get('underlyingZoning');
    const developmentSite = this.get('developmentSite');
    const currentZoning = await PROPOSE_SPECIAL_DISTRICTS_QUERY(developmentSite);
    const result = await REZONING_AREA_QUERY(currentZoning, proposedZoning);

    this.set('rezoningArea', result);
  }

  // ******** COMPUTING THE CURRENT STEP FOR ROUTING ********

  @computed(...fieldsForCurrentStep)
  get currentStep() {
    const {
      projectName,
      developmentSite,
      projectArea,
      // rezoningArea,
      underlyingZoning,
      commercialOverlays,
      specialPurposeDistricts,
      needProjectArea,
      needRezoning,
      needUnderlyingZoning,
      needCommercialOverlay,
      needSpecialDistrict,
    } = this.getProperties(...fieldsForCurrentStep);

    if (isEmpty(projectName)) {
      return { label: 'project-creation', route: 'projects.new' };
    }

    if (isEmpty(developmentSite)) {
      return { label: 'development-site', route: 'projects.edit.steps.development-site' };
    }

    // questions
    if (trueOrNull(needProjectArea) && isEmpty(projectArea)) {
      return { label: 'project-area', route: 'projects.edit.steps.project-area' };
    }

    if (trueOrNull(needUnderlyingZoning) && needRezoning && isEmpty(underlyingZoning)) {
      return {
        label: 'rezoning-underlying',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'underlying-zoning',
      };
    }

    if (trueOrNull(needCommercialOverlay) && needRezoning && isEmpty(commercialOverlays)) {
      return {
        label: 'rezoning-commercial',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'commercial-overlays',
      };
    }

    if (trueOrNull(needSpecialDistrict) && needRezoning && isEmpty(specialPurposeDistricts)) {
      return {
        label: 'rezoning-special',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'special-purpose-districts',
      };
    }

    if (trueOrNull(needRezoning)
      || ((needUnderlyingZoning && isEmpty(underlyingZoning))
        || (needCommercialOverlay && isEmpty(commercialOverlays))
        || (needSpecialDistrict && isEmpty(specialPurposeDistricts)))) {
      return { label: 'rezoning', route: 'projects.edit.steps.rezoning' };
    }

    return { label: 'complete', route: 'projects.show' };
  }

  @computed('currentStep')
  get currentStepNumber() {
    const currentStep = this.get('currentStep');
    if (currentStep.label === 'rezoning') { return 3; }
    if (currentStep.label === 'complete') { return 3; }
    if (currentStep.label === 'project-area') { return 2; }
    return 1;
  }

  // ******** CHECKS AND METHODS FOR REZONING QUESTIONS ********
  setRezoningFalse() {
    this.set('needRezoning', false);
    this.set('needUnderlyingZoning', null);
    this.set('needCommercialOverlay', null);
    this.set('needSpecialDistrict', null);
  }

  @computed('needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get rezoningAnsweredAll() {
    if ((this.get('needRezoning') === true) && (this.get('needUnderlyingZoning') != null) && (this.get('needCommercialOverlay') != null) && (this.get('needSpecialDistrict') != null)) return true;
    return false;
  }

  @computed('rezoningAnsweredAll', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get rezoningAnsweredLogically() {
    if (this.get('rezoningAnsweredAll') && (this.get('needUnderlyingZoning') || this.get('needCommercialOverlay') || this.get('needSpecialDistrict'))) return true;
    if (this.get('rezoningAnsweredAll')) return false;
    return false;
  }

  @computed('needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get firstGeomType() {
    if ((this.get('needRezoning') === true) && (this.get('needUnderlyingZoning') === true)) return 'underlying-zoning';
    if ((this.get('needRezoning') === true) && (this.get('needCommercialOverlay') === true)) return 'commercial-overlays';
    if ((this.get('needRezoning') === true) && (this.get('needSpecialDistrict') === true)) return 'special-purpose-districts';
    return false;
  }

  // ********************************

  @computed('projectArea')
  get projectAreaSource() {
    const projectArea = this.get('projectArea');
    return {
      type: 'geojson',
      data: projectArea,
    };
  }

  @computed('developmentSite', 'projectArea', 'rezoningArea')
  get projectGeometryBoundingBox() {
    // build a geojson FeatureCollection from all three project geoms
    const featureCollections = this
      .getProperties('developmentSite', 'projectArea', 'rezoningArea');

    // flatten feature collections
    const featureCollection = Object.values(featureCollections)
      .reduce((acc, { features }) => {
        acc.features.push(...features);

        return acc;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    if (isEmpty(featureCollection)) return undefined;

    return turfBbox(featureCollection);
  }
}
