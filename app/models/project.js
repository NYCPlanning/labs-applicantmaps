import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import { camelize } from '@ember/string';
import carto from 'cartobox-promises-utility/utils/carto';
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

export const INTERSECTING_ZONING_QUERY = (developmentSite) => {
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
      SELECT ST_Intersection(zoning.the_geom, buffer.the_geom) AS the_geom, zonedist AS label
      FROM planninglabs.zoning_districts_v201809 zoning, buffer
      WHERE ST_Intersects(zoning.the_geom,buffer.the_geom)
    `;

    return new carto.SQL(zoningQuery, 'geojson');
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

// const hasAnswered = property => property !== null;
const trueOrNull = property => property === true || property === null;

export default class extends Model {
  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @computed(...mapTypes.map(type => `${camelize(type)}.@each.length`))
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
  @attr({ defaultValue: null }) developmentSite

  @attr() projectArea

  @attr() underlyingZoning

  async setDefaultUnderlyingZoning() {
    const developmentSite = this.get('developmentSite');
    const result = await INTERSECTING_ZONING_QUERY(developmentSite);

    this.set('underlyingZoning', result);
  }

  @attr() commercialOverlays

  async setDefaultCommercialOverlays() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSED_COMMERCIAL_OVERLAYS_QUERY(developmentSite);

    this.set('commercialOverlays', result);
  }

  @attr() specialPurposeDistricts

  async setDefaultSpecialPurposeDistricts() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSE_SPECIAL_DISTRICTS_QUERY(developmentSite);

    this.set('specialPurposeDistricts', result);
  }

  @attr() rezoningArea

  // ******** VALIDATION CHECKS / STEPS ********

  // @computed(...requiredFields)
  // get isValid() {
  //   return requiredFields.every(field => this.get(field));
  // }

  // @computed(...requiredFields)
  // get requiredFieldsCompleted() {
  //   return requiredFields.filter(field => this.get(field));
  // }

  // ******** COMPUTING THE CURRENT STEP FOR ROUTING ********

  @computed(...fieldsForCurrentStep)
  get currentStep() {
    const {
      projectName,
      developmentSite,
      projectArea,
      rezoningArea,
      underlyingZoning,
      commercialOverlays,
      specialPurposeDistricts,
      needProjectArea,
      needRezoning,
      needUnderlyingZoning,
      needCommercialOverlay,
      needSpecialDistrict,
    } = this.getProperties(...fieldsForCurrentStep);

    // const currentQuestion = questionFields.find(q => hasAnswered(q));

    if (!projectName) {
      return { label: 'project-creation', route: 'projects.new' };
    }

    if (!developmentSite) {
      return { label: 'development-site', route: 'projects.edit.steps.development-site' };
    }

    // questions
    if (trueOrNull(needProjectArea) && !projectArea) {
      return { label: 'project-area', route: 'projects.edit.steps.project-area' };
    }

    if (trueOrNull(needUnderlyingZoning) && needRezoning && !underlyingZoning) {
      return {
        label: 'rezoning-underlying',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'underlying-zoning',
      };
    }

    if (trueOrNull(needCommercialOverlay) && needRezoning && !commercialOverlays) {
      return {
        label: 'rezoning-commercial',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'commercial-overlays',
      };
    }

    if (trueOrNull(needSpecialDistrict) && needRezoning && !specialPurposeDistricts) {
      return {
        label: 'rezoning-special',
        route: 'projects.edit.geometry-edit',
        mode: 'draw',
        type: 'special-purpose-districts',
      };
    }

    // if (trueOrNull(needRezoning) && !rezoningArea) {
    //   return { label: 'rezoning', route: 'projects.edit.steps.rezoning' };
    // }

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
    const geometries = this.getProperties('developmentSite', 'projectArea', 'rezoningArea');

    // if all three are undefined, return undefined
    const allUndefined = Object.values(geometries)
      .reduce((acc, geometry) => acc && !geometry, true);
    if (allUndefined) return undefined;

    const featureCollection = Object.values(geometries)
      .reduce((acc, geometry) => {
        if (geometry) {
          acc.features.push({
            type: 'Feature',
            geometry,
          });
        }

        return acc;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    return turfBbox(featureCollection);
  }
}
