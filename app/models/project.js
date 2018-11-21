import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import turfDifference from '@turf/difference';
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

// takes `id` from properties, and copies it to `id` at the top level of each feature
// used by mapbox-gl-draw to identify features for when editing
const elevateGeojsonIds = (FeatureCollection) => {
  // add an id to the top level of each feature object, for use by mapbox-gl-draw
  const { features } = FeatureCollection;
  FeatureCollection.features = features.map((feature) => {
    feature.id = feature.properties.id;
    return feature;
  });

  return FeatureCollection;
};

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

    return elevateGeojsonIds(clippedZoningDistricts);
  }

  return null;
};

export const PROPOSED_COMMERCIAL_OVERLAYS_QUERY = async (developmentSite) => {
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
      SELECT ST_Intersection(co.the_geom, buffer.the_geom) AS the_geom, overlay AS label, cartodb_id AS id
      FROM planninglabs.commercial_overlays_v201809 co, buffer
      WHERE ST_Intersects(co.the_geom,buffer.the_geom)
    `;

    const clippedCommercialOverlays = await new carto.SQL(commercialOverlaysQuery, 'geojson');

    return elevateGeojsonIds(clippedCommercialOverlays);
  }

  return null;
};

export const PROPOSE_SPECIAL_DISTRICTS_QUERY = async (developmentSite) => {
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
      SELECT ST_Intersection(spd.the_geom, buffer.the_geom) AS the_geom, sdname AS label, cartodb_id AS id
      FROM planninglabs.special_purpose_districts_v201809 spd, buffer
      WHERE ST_Intersects(spd.the_geom,buffer.the_geom)
    `;

    const clippedSpecialPurposeDistricts = await new carto.SQL(specialPurposeDistrictsQuery, 'geojson');

    return elevateGeojsonIds(clippedSpecialPurposeDistricts);
  }

  return null;
};

const getDifference = (current, proposed) => {
  if (!proposed) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
  // create an empty FeatureCollection to hold the difference sections
  const differenceFC = {
    type: 'FeatureCollection',
    features: [],
  };

  // flag differences
  proposed.features.forEach((feature) => {
    const { id } = feature;
    const correspondingCurrentFeature = current.features.filter(d => d.id === id)[0];

    // if feature exists in currentZoning, compare the geometries
    if (correspondingCurrentFeature) {
      // get the difference
      const difference = turfDifference(correspondingCurrentFeature, feature);
      if (difference) differenceFC.features.push(difference);

      // get the inverse difference (reverse the order of the polygons)
      const inverseDifference = turfDifference(feature, correspondingCurrentFeature);
      if (inverseDifference) differenceFC.features.push(inverseDifference);
    } else {
      differenceFC.features.push(feature);
    }
  });

  return differenceFC;
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

    return differenceUnion.geometry;
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

  async setRezoningArea() {

    // underlyingZoning
    const currentZoning = await INTERSECTING_ZONING_QUERY(this.get('developmentSite'));
    const proposedZoning = this.get('underlyingZoning');
    const underlyingZoningDiff = getDifference(currentZoning, proposedZoning);

    // commercial Overlays


    // special purpose districts
    const currentSpecialPurposeDistricts = await PROPOSE_SPECIAL_DISTRICTS_QUERY(this.get('developmentSite'));
    const proposedSpecialPurposeDistricts = this.get('specialPurposeDistricts');
    const specialPurposeDistrictsDiff = getDifference(currentSpecialPurposeDistricts, proposedSpecialPurposeDistricts);

    const combinedFC = {
      type: 'FeatureCollection',
      features: [...underlyingZoningDiff.features, ...specialPurposeDistrictsDiff.features],
    };

    // union together all difference features
    if (combinedFC.features.length > 0) {
      const differenceUnion = combinedFC.features
        .reduce((union, { geometry }) => {
          if (union === null) {
            union = geometry;
          } else {
            union = turfUnion(union, geometry);
          }

          const buffered = turfBuffer(union, -0.0005);
          return buffered;
        }, null);

      this.set('rezoningArea', differenceUnion.geometry);
    }
  }

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

    if (trueOrNull(needRezoning)
      || ((needUnderlyingZoning && !underlyingZoning)
        || (needCommercialOverlay && !commercialOverlays)
        || (needSpecialDistrict && !specialPurposeDistricts))) {
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
