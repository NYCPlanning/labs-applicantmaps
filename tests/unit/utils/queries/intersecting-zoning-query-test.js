import queriesIntersectingZoningQuery from 'labs-applicant-maps/utils/queries/intersecting-zoning-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | queries/intersecting-zoning-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it works', async function(assert) {
    this.server.createList('project', 1);
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);

    const result = queriesIntersectingZoningQuery(
      model.get('developmentSite'),
    );
    assert.ok(result);
  });
});
