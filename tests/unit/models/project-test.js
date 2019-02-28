import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { GEOMETRY_TYPES } from 'labs-applicant-maps/models/geometric-property';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const NonEmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0],
    },
    properties: {
      isEmptyDefault: true,
    },
  }],
};

const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {},
  }],
};

module('Unit | Model | project', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  // Test for project not yet created
  test('it produces project-creation step', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = await store.createRecord('project');
    assert.equal(model.get('currentStep.step'), 'project-creation');
  });

  // Test for project created but development site not yet defined
  test('it produces development-site step', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
    }));
    assert.equal(model.get('currentStep.step'), 'development-site');
  });

  // Test for project completion when only development site is required
  test('it produces complete status', async function (assert) {
    const dummyFeatureCollection = NonEmptyFeatureCollection;

    const store = this.owner.lookup('service:store');
    const geometricProperty = store.createRecord('geometric-property', {
      proposedGeometry: dummyFeatureCollection,
      geometryType: 'developmentSite',
    });

    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: false,
      geometricProperties: [geometricProperty],
    }));
    await model.save();
    assert.equal(model.get('currentStep.step'), 'complete');
  });

  // Test for project incomplete project that hasn't answered rezoning question
  test('it produces rezoning step', async function (assert) {
    const dummyFeatureCollection = NonEmptyFeatureCollection;

    const store = this.owner.lookup('service:store');
    const geometricProperty = store.createRecord('geometric-property', {
      proposedGeometry: dummyFeatureCollection,
      geometryType: 'developmentSite',
    });
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: null,
      geometricProperties: [geometricProperty],
    }));
    await model.save();

    assert.equal(model.get('currentStep.step'), 'rezoning');
  });

  // Test project geometric property setters (developmentSite)
  test('it updates the given geometric property', function (assert) {
    const dummyFeatureCollection = NonEmptyFeatureCollection;

    const store = this.owner.lookup('service:store');

    // create geometric property for each type
    const geometricProperties = [];
    GEOMETRY_TYPES.forEach((geometryType) => {
      geometricProperties.push(store.createRecord('geometric-property', {
        proposedGeometry: dummyFeatureCollection,
        geometryType,
      }));
    });

    // create project with all geometric properties
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      needProjectArea: false,
      needRezoning: null,
      geometricProperties,
    }));

    // assert values of all geometric properties are expected
    GEOMETRY_TYPES.forEach((geometryType) => {
      assert.equal(model.get(geometryType), dummyFeatureCollection);
    });

    // use setter to update values of all geometric properties
    GEOMETRY_TYPES.forEach((geometryType) => {
      model.set(geometryType, EmptyFeatureCollection);
    });

    // assert geometric properties have been updated
    GEOMETRY_TYPES.forEach((geometryType) => {
      assert.equal(model.get(geometryType), EmptyFeatureCollection);
    });
  });
});
