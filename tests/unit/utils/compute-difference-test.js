import computeDifference from 'labs-applicant-maps/utils/compute-difference';
import queriesIntersectingZoningQuery from 'labs-applicant-maps/utils/queries/intersecting-zoning-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

const { randomPolygon } = random;

module('Unit | Utility | compute-difference', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it computes difference', async function(assert) {
    this.server.createList('project', 1);
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const current = await queriesIntersectingZoningQuery(
      model.get('developmentSite'),
    );
    const proposed = randomPolygon(4);

    const result = computeDifference(current, proposed);
    assert.ok(result);
  });

  test('it returns empty feature collection if proposed is falsey', async function(assert) {
    this.server.createList('project', 1);
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const current = await queriesIntersectingZoningQuery(
      model.get('developmentSite'),
    );

    const result = computeDifference(current, false);

    assert.ok(isEmpty(result));
  });
});
