import unifyPolygons from 'labs-applicant-maps/utils/unify-polygons';
import { module, test } from 'qunit';

const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {},
  }],
};

module('Unit | Utility | unify-polygons', function() {
  // Replace this with your real tests.
  const dummyFeatureCollection = EmptyFeatureCollection;
  const dummyPolygon = {
    type: 'Polygon',
    coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]],
  };

  dummyFeatureCollection.features[0].geometry = dummyPolygon;
  dummyFeatureCollection.features.push({
    type: 'Feature',
    geometry: dummyPolygon,
  });

  test('it works', function(assert) {
    const result = unifyPolygons(dummyFeatureCollection);
    assert.ok(result);
  });
});
