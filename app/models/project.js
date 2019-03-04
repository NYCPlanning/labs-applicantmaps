import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import { not, alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import turfBbox from '@turf/bbox';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import wizard from 'labs-applicant-maps/utils/wizard';
import { debug } from '@ember/debug';
import { GEOMETRY_TYPES } from './geometric-property';

const { Model } = DS;

export const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {
      isEmptyDefault: true,
    },
  }],
};

// (property,key) basic checks
const hasAnswered = property => property === true || property === false;
const hasFilledOut = property => !isEmpty(property);
const hasFilledOutAndProposedDifferingZoning = function(property, key) {
  debug(`
    check;
      ${key}
      is it empty? ${!isEmpty(property)}
      proposedDiffersFromCanonical is ${this.underlyingZoningModel.proposedDiffersFromCanonical}
  `);
  return !isEmpty(property) && this.get(`${key}Model.proposedDiffersFromCanonical`);
};

// checks that the schema key isn't dirty
const isClean = function(property, key) {
  return !this.get(`${key}Model`).hasDirtyAttributes;
};

// aggregate checks
const requiredIf = function(question, conditionalTest = hasAnswered) {
  return function(property, key) {
    return this.get(question) ? conditionalTest.bind(this)(property, key) : true;
  };
};
const and = function(...checks) {
  return function(property, key) {
    return checks.every(check => check.bind(this)(property, key));
  };
};

// TODO add steps for the real edit pages bt the steps
export const projectProcedure = [
  {
    step: 'project-creation',
    routing: {
      route: 'projects.edit',
    },
    conditions: {
      projectName: hasFilledOut,
    },
  },
  {
    step: 'development-site',
    routing: {
      route: 'projects.edit.steps.development-site',
    },
    conditions: {
      needDevelopmentSite: hasFilledOut,
    },
  },
  {
    step: 'development-site-create',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'development-site',
    },
    conditions: {
      developmentSite: and(hasFilledOut, isClean),
    },
  },
  {
    step: 'project-area',
    routing: {
      route: 'projects.edit.steps.project-area',
    },
    conditions: {
      needProjectArea: hasAnswered,
    },
  },
  {
    step: 'project-area-create',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'project-area',
    },
    conditions: {
      needProjectArea: hasAnswered,
      projectArea: requiredIf('needProjectArea', hasFilledOut),
      isClean: Boolean,
    },
  },
  {
    step: 'development-site-create',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'commercial-overlays',
    },
    conditions: {
      projectName: hasFilledOut,
    },
  },
  {
    step: 'rezoning',
    routing: {
      route: 'projects.edit.steps.rezoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
      needCommercialOverlay: requiredIf('needRezoning', hasAnswered),
      needSpecialDistrict: requiredIf('needRezoning', hasAnswered),
    },
  },
  {
    step: 'rezoning-underlying',
    routing: {
      route: 'projects.edit.steps.rezoning',
      mode: 'draw',
      type: 'underlying-zoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
      underlyingZoning: requiredIf('needUnderlyingZoning', hasFilledOutAndProposedDifferingZoning),
      isClean: Boolean,
    },
  },
  {
    step: 'rezoning-commercial',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'commercial-overlays',
    },
    conditions: {
      needRezoning: hasAnswered,
      needCommercialOverlay: requiredIf('needRezoning', hasAnswered),
      commercialOverlays: requiredIf('needCommercialOverlay', hasFilledOutAndProposedDifferingZoning),
      isClean: Boolean,
    },
  },
  {
    step: 'rezoning-special',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'special-purpose-districts',
    },
    conditions: {
      needRezoning: hasAnswered,
      needSpecialDistrict: requiredIf('needRezoning', hasAnswered),
      specialPurposeDistricts: requiredIf('needSpecialDistrict', hasFilledOutAndProposedDifferingZoning),
      isClean: Boolean,
    },
  },
  {
    step: 'complete',
    routing: {
      label: 'complete',
      route: 'projects.show',
    },
  },
];

const procedureKeys = projectProcedure
  .reduce((acc, { conditions }) => acc.concat(conditions ? Object.keys(conditions) : []), []);

export default class Project extends Model {
  init(...args) {
    super.init(...args);

    // add geometries of each type if they don't exist
    // this really should happen on the server
    GEOMETRY_TYPES.forEach((geometryType) => {
      if (!this.get('geometricProperties').findBy('geometryType', geometryType)) {
        const geometricProp = this.store.createRecord('geometric-property', {
          geometryType,
          project: this,
        });

        this.get('geometricProperties')
          .pushObject(geometricProp);
      }
    });
  }

  @service store;

  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @hasMany('geometric-property', { async: false }) geometricProperties;

  @attr({ defaultValue: () => EmptyFeatureCollection })
  annotations;

  // ******** BASIC PROJECT CREATION INFO ********
  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  @attr('number') stepLabel

  // ******** REQUIRED ANSWERS ********
  @attr('boolean', { allowNull: true, defaultValue: null }) needDevelopmentSite;

  @attr('boolean', { allowNull: true, defaultValue: null }) needProjectArea;

  @attr('boolean', { allowNull: true, defaultValue: null }) needRezoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { allowNull: true, defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  /**
   *
   * DevelopmentSite
   * FeatureCollection of polygons or multipolygons
   */

  // questions:
  // can we have these return the model? Then in the wizard, use dot notation
  // too get the proposedGeometry?
  // how are these setters used? used in tests, they could remain the same actually
  // we need to change these and create new computeds that only return the model
  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get developmentSiteModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'developmentSite');
  }

  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get projectAreaModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'projectArea');
  }

  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get underlyingZoningModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'underlyingZoning');
  }

  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get commercialOverlaysModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'commercialOverlays');
  }

  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get specialPurposeDistrictsModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'specialPurposeDistricts');
  }

  @computed('geometricProperties.@each.{proposedGeometry,hasDirtyAttributes}')
  get rezoningAreaModel() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'rezoningArea');
  }

  @alias('developmentSiteModel.proposedGeometry')
  developmentSite;

  @alias('projectAreaModel.proposedGeometry')
  projectArea;

  @alias('underlyingZoningModel.proposedGeometry')
  underlyingZoning;

  @alias('commercialOverlaysModel.proposedGeometry')
  commercialOverlays;

  @alias('specialPurposeDistrictsModel.proposedGeometry')
  specialPurposeDistricts;

  @alias('rezoningAreaModel.proposedGeometry')
  rezoningArea;

  async setRezoningArea() {
    const rezoningArea = this.get('geometricProperties').findBy('geometryType', 'rezoningArea');

    await rezoningArea.setCanonical();
  }

  // ******** COMPUTING THE CURRENT STEP FOR ROUTING ********
  @computed(...procedureKeys, 'isClean')
  get currentStep() {
    const currStep = wizard(projectProcedure, this);
    debug(`
      currStep:
        step: ${currStep.step}
        route: ${currStep.routing.route}
        one of these is falsey: ${currStep.conditions ? Object.keys(currStep.conditions) : ''}
    `);
    return currStep;
  }

  @computed('currentStep')
  get previousStep() {
    const { step } = this.get('currentStep');
    const previousStepIndex = projectProcedure.findIndex(({ step: thisStep }) => thisStep === step) - 1;
    const previousStep = projectProcedure[previousStepIndex];
    debug(`
        previousStep: 
          previous: ${previousStep.step}
          route: ${previousStep.routing.route}
          index: ${previousStepIndex}
          currStep: ${step}
    `);

    return previousStep;
  }

  @not('hasDirtyAttributes') isClean;

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

  @computed('geometricProperties.@each.proposedGeometry')
  get projectGeometryBoundingBox() {
    // build a geojson FeatureCollection from all three project geoms
    // const featureCollections = this

    const featureCollections = this
      .get('geometricProperties')
      .filter((geometricProperty) => {
        const geometryType = geometricProperty.get('geometryType');
        return ['developmentSite', 'projectArea', 'rezoningArea'].indexOf(geometryType) > -1;
      })
      .mapBy('proposedGeometry');

    // flatten feature collections
    const featureCollection = featureCollections
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
