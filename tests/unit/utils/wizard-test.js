import EmberObject from '@ember/object';
import wizard from 'labs-applicant-maps/utils/wizard';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

// we're testing the wizard, not the domain
// so, we pull a version of the procedure for the test.
const hasAnswered = property => property === true || property === false;
const hasFilledOut = property => !isEmpty(property);
const requiredIf = function(question, conditionalTest = hasAnswered) {
  return function(property) {
    return this.get(question) ? conditionalTest(property) : true;
  };
};

const projectProcedure = [
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
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
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

const DUMMY_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0],
    },
  }],
};

module('Unit | Utility | wizard', function(hooks) {
  setupTest(hooks);

  // sanity check
  test('Dummy feature collection is "not empty"', function(assert) {
    assert.equal(isEmpty(DUMMY_FEATURE_COLLECTION), false);
  });

  // Replace this with your real tests.
  test('answers yes to all questions', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', true);
    model.set('projectArea', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: true,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-commercial');

    model.set('commercialOverlays', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers yes to all questions but project area', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: true,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-commercial');

    model.set('commercialOverlays', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers yes to all questions, no to needCommercialOverlay', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: false,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers yes to all questions, no to needCommercialOverlay and needSpecialDistrict', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: false,
      needSpecialDistrict: false,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers yes to all questions, no to needRezoning', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: false,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers yes to all questions but no to projectArea', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: true,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-commercial');

    model.set('commercialOverlays', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers no to all questions', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: false,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers no to all questions but yes to needRezoning, needUnderlyingZoning', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: true,
      needCommercialOverlay: false,
      needSpecialDistrict: false,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-underlying');

    model.set('underlyingZoning', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers no to all questions but yes to needRezoning, needCommercialOverlay', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: false,
      needCommercialOverlay: true,
      needSpecialDistrict: false,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-commercial');

    model.set('commercialOverlays', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers no to all questions but yes to needRezoning, needSpecialDistrict', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: false,
      needCommercialOverlay: false,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });

  test('answers no to all questions but yes to needRezoning, needCommercialOverlay, and needSpecialDistrict', function(assert) {
    const model = EmberObject.create();
    let step;

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-creation');

    model.set('projectName', 'Mulholland Drive');

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'development-site');

    model.set('developmentSite', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'project-area');

    model.set('needProjectArea', false);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning');

    model.setProperties({
      needRezoning: true,
      needUnderlyingZoning: false,
      needCommercialOverlay: true,
      needSpecialDistrict: true,
    });

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-commercial');

    model.set('commercialOverlays', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'rezoning-special');

    model.set('specialPurposeDistricts', DUMMY_FEATURE_COLLECTION);

    ({ step } = wizard(projectProcedure, model));
    assert.equal(step, 'complete');
  });
});
