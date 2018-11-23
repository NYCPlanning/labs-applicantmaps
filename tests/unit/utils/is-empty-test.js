import isEmpty from 'labs-applicant-maps/utils/is-empty';
import { module, test } from 'qunit';

const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {},
  }],
};

module('Unit | Utility | is-empty', function() {
  // Replace this with your real tests.
  test('it detects null geometry as empty', function(assert) {
    const result = isEmpty(EmptyFeatureCollection);
    assert.equal(result, true);
  });

  test(`
    Test that a single null geometry in a feature collection of more than 1
    feature is NOT empty. FC is empty strictly when every FC is a null geometry.
  `, function(assert) {
    const dummyFeatureCollection = EmptyFeatureCollection;

    dummyFeatureCollection.features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    const result = isEmpty(EmptyFeatureCollection);
    assert.equal(result, false);
  });

  test('Regular objects are truthy', function(assert) {
    const result = isEmpty({ key: 'value', anotherKey: 'anotherValue' });
    assert.equal(result, false);
  });
});
