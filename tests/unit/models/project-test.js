import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
  test('it produces complete status', function (assert) {
    const dummyFeatureCollection = EmptyFeatureCollection;

    dummyFeatureCollection.features[0].geometry = {
      type: 'Point',
      coordinates: [0, 0],
    };

    const store = this.owner.lookup('service:store');
    const geometricProperty = store.createRecord('geometric-property', {
      proposedGeometry: dummyFeatureCollection,
      geometryType: 'developmentSite',
    });

    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      needProjectArea: false,
      needRezoning: false,
      geometricProperties: [geometricProperty],
    }));
    assert.equal(model.get('currentStep.step'), 'complete');
  });

  // Test for project incomplete project that hasn't answered rezoning question
  test('it produces rezoning step', function (assert) {
    const dummyFeatureCollection = EmptyFeatureCollection;

    dummyFeatureCollection.features[0].geometry = {
      type: 'Point',
      coordinates: [0, 0],
    };

    const store = this.owner.lookup('service:store');
    const geometricProperty = store.createRecord('geometric-property', {
      proposedGeometry: dummyFeatureCollection,
      geometryType: 'developmentSite',
    });
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      needProjectArea: false,
      needRezoning: null,
      geometricProperties: [geometricProperty],
    }));

    assert.equal(model.get('currentStep.step'), 'rezoning');
  });
});
