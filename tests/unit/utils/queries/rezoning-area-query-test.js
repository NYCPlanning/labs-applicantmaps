import queriesRezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import { module, test } from 'qunit';
import random from '@turf/random';

const { randomPolygon } = random;

module('Unit | Utility | queries/rezoning-area-query', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const zoningChange = randomPolygon(10);
    const result = queriesRezoningAreaQuery(zoningChange);

    assert.ok(result.features);
  });
});
