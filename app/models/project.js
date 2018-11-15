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
  @attr('boolean', { defaultValue: null }) needProjectArea;

  @attr('boolean', { defaultValue: null }) needRezoning;

  @attr('boolean', { defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  @attr({ defaultValue: null }) developmentSite

  @attr() projectArea

  @attr() proposedZoning

  async setDefaultProposedZoning() {
    const developmentSite = this.get('developmentSite');
    const result = await INTERSECTING_ZONING_QUERY(developmentSite);

    this.set('proposedZoning', result);
  }

  @attr() proposedCommercialOverlays

  async setDefaultProposedCommercialOverlays() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSED_COMMERCIAL_OVERLAYS_QUERY(developmentSite);

    this.set('proposedCommercialOverlays', result);
  }

  @attr() proposedSpecialDistricts

  async setDefaultProposedSpecialDistricts() {
    const developmentSite = this.get('developmentSite');
    const result = await PROPOSE_SPECIAL_DISTRICTS_QUERY(developmentSite);

    this.set('proposedSpecialDistricts', result);
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

  @computed('developmentSite', 'projectName', 'projectArea', 'rezoningArea', 'proposedZoning', 'proposedCommercialOverlays', 'proposedSpecialDistricts', 'needProjectArea', 'needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get currentStep() {
    const projectName = this.get('projectName');
    const developmentSite = this.get('developmentSite');
    const projectArea = this.get('projectArea');
    const rezoningArea = this.get('rezoningArea');
    const proposedZoning = this.get('proposedZoning');
    const proposedCommercialOverlays = this.get('proposedCommercialOverlays');
    const proposedSpecialDistricts = this.get('proposedSpecialDistricts');
    const needProjectArea = this.get('needProjectArea');
    const needRezoning = this.get('needRezoning');
    const needUnderlyingZoning = this.get('needUnderlyingZoning');
    const needCommercialOverlay = this.get('needCommercialOverlay');
    const needSpecialDistrict = this.get('needSpecialDistrict');

    if (projectName == null || projectName === '') {
      return { label: 'project-creation', route: 'projects.new' };
    } if (developmentSite == null) {
      return { label: 'development-site', route: 'projects.edit.steps.development-site' };
    } if ((needProjectArea === true || needProjectArea == null) && projectArea == null) {
      return { label: 'project-area', route: 'projects.edit.steps.project-area' };
    } if ((needRezoning === true || needRezoning == null) && rezoningArea == null) {
      return { label: 'rezoning', route: 'projects.edit.steps.rezoning' };
    } if ((needRezoning === true && (needUnderlyingZoning === true || needUnderlyingZoning == null)) && proposedZoning == null) {
      return { label: 'rezoning-underlying', route: 'projects.edit.steps.rezoning' };
    } if ((needRezoning === true && (needCommercialOverlay === true || needCommercialOverlay == null)) && proposedCommercialOverlays == null) {
      return { label: 'rezoning-commercial', route: 'projects.edit.steps.rezoning' };
    } if ((needRezoning === true && (needSpecialDistrict === true || needSpecialDistrict == null)) && proposedSpecialDistricts == null) {
      return { label: 'rezoning-special', route: 'projects.edit.steps.rezoning' };
    } return { label: 'complete', route: 'projects.show' };
  }

  @computed('currentStep')
  get currentStepNumber() {
    const currentStep = this.get('currentStep');
    if (currentStep.label === 'rezoning') { return 3; }
    if (currentStep.label === 'complete') { return 3; }
    if (currentStep.label === 'project-area') { return 2; }
    return 1;
  }

  // @computed()
  // get hasCompletedSteps() {
  //   // need a way to compute this
  //   return false;
  // }

  @computed('projectArea')
  get projectAreaSource() {
    const projectArea = this.get('projectArea');
    return {
      type: 'geojson',
      data: projectArea,
    };
  }

  // ********************************

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
