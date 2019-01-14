import queriesProposedSpecialDistrictsQuery from 'labs-applicant-maps/utils/queries/proposed-special-districts-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | queries/proposed-special-districts-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it works', async function(assert) {
    this.server.createList('project', 1);

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const result = queriesProposedSpecialDistrictsQuery(
      model.get('developmentSite'),
    );
    assert.ok(result);
  });
});
