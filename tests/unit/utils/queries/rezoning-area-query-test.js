import queriesRezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import { module, test } from 'qunit';
import { developmentSite } from 'labs-applicant-maps/mirage/factories/project';

module('Unit | Utility | queries/rezoning-area-query', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const result = queriesRezoningAreaQuery(developmentSite);

    assert.ok(result.features);
  });
});
