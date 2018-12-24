import queriesRezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | queries/rezoning-area-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it works', async function(assert) {
    this.server.createList('project', 1);

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    await model.setDefaultUnderlyingZoning();

    const result = queriesRezoningAreaQuery(
      model.get('underlyingZoning'),
    );

    assert.ok(result.features);
  });
});
