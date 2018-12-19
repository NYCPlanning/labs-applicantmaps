import unifyPolygons from 'labs-applicant-maps/utils/unify-polygons';
import { module, test } from 'qunit';
import random from 'labs-applicant-maps/helpers/random-geometry';

const { randomPolygon } = random;

module('Unit | Utility | unify-polygons', function() {
  const dummyFeatureCollection = randomPolygon(10);

  test('it works', function(assert) {
    const result = unifyPolygons(dummyFeatureCollection);
    assert.ok(result);
  });
});
