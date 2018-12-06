import elevateGeojsonIds from 'labs-applicant-maps/utils/elevate-geojson-ids';
import { module, test } from 'qunit';
import random from '@turf/random';

const { randomPolygon } = random;

module('Unit | Utility | elevate-geojson-ids', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const result = elevateGeojsonIds(randomPolygon(10));
    assert.ok(result);
  });
});
