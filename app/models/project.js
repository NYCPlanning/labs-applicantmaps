import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import { camelize } from '@ember/string';
import {
  type,
  arrayOf,
  shapeOf,
  unionOf,
  optional,
  oneOf,
} from '@ember-decorators/argument/type';
import intersectingZoningQuery from 'labs-applicant-maps/utils/queries/intersecting-zoning-query';
import proposedCommercialOverlaysQuery from 'labs-applicant-maps/utils/queries/proposed-commercial-overlays-query';
import proposedSpecialDistrictsQuery from 'labs-applicant-maps/utils/queries/proposed-special-districts-query';
import rezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import wizard from 'labs-applicant-maps/utils/wizard';
import config from 'labs-applicant-maps/config/environment';

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
    properties: {
      isEmptyDefault: true,
    },
  }],
};

const Feature = shapeOf({
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


const hasAnswered = property => property === true || property === false;
const hasFilledOut = property => !isEmpty(property);
const requiredIf = function(question, conditionalTest = hasAnswered) {
  return function(property) {
    return this.get(question) ? conditionalTest(property) : true;
  };
};

export const projectProcedure = [
  {
    step: 'project-creation',
    routing: {
      route: 'projects.new',
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
      developmentSite: hasFilledOut,
    },
  },
  {
    step: 'project-area',
    routing: {
      route: 'projects.edit.steps.project-area',
    },
    conditions: {
      needProjectArea: hasAnswered,
      projectArea: requiredIf('needProjectArea', hasFilledOut),
    },
  },
  {
    step: 'rezoning',
    routing: {
      route: 'projects.edit.steps.rezoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasFilledOut),
      needCommercialOverlay: requiredIf('needRezoning', hasAnswered),
      needSpecialDistrict: requiredIf('needRezoning', hasAnswered),
    },
  },
  {
    step: 'rezoning-underlying',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'underlying-zoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
      underlyingZoning: requiredIf('needUnderlyingZoning', hasFilledOut),
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
      commercialOverlays: requiredIf('needCommercialOverlay', hasFilledOut),
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
      specialPurposeDistricts: requiredIf('needSpecialDistrict', hasFilledOut),
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
    const result = await intersectingZoningQuery(developmentSite);

    this.set('underlyingZoning', result);
  }

  // FeatureCollection
  // includes label information that must be stored as properties
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) commercialOverlays

  async setDefaultCommercialOverlays() {
    const developmentSite = this.get('developmentSite');
    const result = await proposedCommercialOverlaysQuery(developmentSite);

    this.set('commercialOverlays', result);
  }

  // FeatureCollection
  // includes label information that must be stored as properties
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) specialPurposeDistricts

  async setDefaultSpecialPurposeDistricts() {
    const developmentSite = this.get('developmentSite');
    const result = await proposedSpecialDistrictsQuery(developmentSite);

    this.set('specialPurposeDistricts', result);
  }

  // FeatureCollection of polygons or multipolygons
  @type(FeatureCollection)
  @attr({ defaultValue: () => EmptyFeatureCollection }) rezoningArea

  async setRezoningArea() {
    const proposedZoning = this.get('underlyingZoning');
    const developmentSite = this.get('developmentSite');
    const currentZoning = await proposedSpecialDistrictsQuery(developmentSite);
    const result = await rezoningAreaQuery(currentZoning, proposedZoning);

    this.set('rezoningArea', result);
  }

  // ******** COMPUTING THE CURRENT STEP FOR ROUTING ********

  @computed(...fieldsForCurrentStep)
  get currentStep() {
    const { routing } = wizard(projectProcedure, this);
    return routing;
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
