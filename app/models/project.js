import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import { camelize } from '@ember/string';
import config from '../config/environment';

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
  'proposedZoning',
  'proposedCommercialOverlays',
  'proposedSpecialDistricts',
  ...questionFields,
];

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
  @attr('boolean', { defaultValue: null }) needProjectArea;

  @attr('boolean', { defaultValue: null }) needRezoning;

  @attr('boolean', { defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  @attr({ defaultValue: null }) developmentSite

  @attr() projectArea

  @attr() rezoningArea

  @attr() proposedZoning

  @attr() proposedCommercialOverlays

  @attr() proposedSpecialDistricts

  // ******** VALIDATION CHECKS / STEPS ********

  // @computed(...requiredFields)
  // get isValid() {
  //   return requiredFields.every(field => this.get(field));
  // }

  // @computed(...requiredFields)
  // get requiredFieldsCompleted() {
  //   return requiredFields.filter(field => this.get(field));
  // }

  @computed(...fieldsForCurrentStep)
  get currentStep() {
    const {
      projectName,
      developmentSite,
      projectArea,
      rezoningArea,
      proposedZoning,
      proposedCommercialOverlays,
      proposedSpecialDistricts,
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

    if (trueOrNull(needRezoning) && !rezoningArea) {
      return { label: 'rezoning', route: 'projects.edit.steps.rezoning' };
    }

    if (trueOrNull(needUnderlyingZoning) && needRezoning && !proposedZoning) {
      return { label: 'rezoning-underlying', route: 'projects.edit.steps.rezoning' };
    }

    if (trueOrNull(needCommercialOverlay) && needRezoning && !proposedCommercialOverlays) {
      return { label: 'rezoning-commercial', route: 'projects.edit.steps.rezoning' };
    }

    if (trueOrNull(needSpecialDistrict) && needRezoning && !proposedSpecialDistricts) {
      return { label: 'rezoning-special', route: 'projects.steps.edit.rezoning' };
    }

    return { label: 'complete', route: 'projects.show' };
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
