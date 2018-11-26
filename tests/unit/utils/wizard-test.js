import wizard from 'labs-applicant-maps/utils/wizard';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import { projectProcedure } from 'labs-applicant-maps/models/project';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';

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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('area-map', {}));
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
});
