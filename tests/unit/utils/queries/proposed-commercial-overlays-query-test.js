import queriesProposedCommercialOverlaysQuery from 'labs-applicant-maps/utils/queries/proposed-commercial-overlays-query';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | queries/proposed-commercial-overlays-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('returns a feature collection when development site passed into commercial overlays query', async function(assert) {
    this.server.create('project', 'hasDevelopmentSite');

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const result = await queriesProposedCommercialOverlaysQuery(
      model.get('developmentSite'),
    );

    assert.ok(result);
    assert.equal(result.type, 'FeatureCollection'); // assert that type property in result object is FeatureCollection
  });
});
