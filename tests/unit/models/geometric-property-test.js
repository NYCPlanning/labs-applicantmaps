import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';

const { randomPolygon } = random;

module('Unit | Model | geometric property', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const project = store.createRecord('project', {});
    const model = store.createRecord('geometric-property', {
      geometryType: 'developmentSite',
      proposedGeometry: randomPolygon(1),
      project,
    });

    assert.ok(model);
  });
});
