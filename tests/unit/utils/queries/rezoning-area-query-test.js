import queriesRezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';

const { randomPolygon } = random;

module('Unit | Utility | queries/rezoning-area-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it works', async function(assert) {
    const project = this.server.create('project');
    this.server.create('geometric-property', {
      geometryType: 'underlyingZoning',
      hasCanonical: true,
      proposedGeometry: randomPolygon(3),
      canonical: randomPolygon(1),
      project,
    });

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    const result = await queriesRezoningAreaQuery(
      model.get('developmentSite'),
      model.get('geometricProperties'),
    );

    assert.ok(result.features);
  });
});
