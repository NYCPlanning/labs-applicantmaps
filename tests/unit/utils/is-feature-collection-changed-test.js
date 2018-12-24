import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
import { module, test } from 'qunit';
import { randomPolygon } from '@turf/random';

module('Unit | Utility | is-feature-collection-changed', function() {
  // Replace this with your real tests.
  test('feature collections of different numbers of features', function(assert) {
    const featureCollection = randomPolygon(2);
    const featureCollection2 = featureCollection;
    featureCollection2.features = [featureCollection.features[0]]; // eslint-disable-line

    const result = isFeatureCollectionChanged(featureCollection, featureCollection2);
    assert.equal(result, false);
  });

  test('features are identical', function(assert) {
    const featureCollection = randomPolygon(2);
    const featureCollection2 = featureCollection;

    const result = isFeatureCollectionChanged(featureCollection, featureCollection2);
    assert.equal(result, false);
  });

  test('null geometry features are handled', function(assert) {
    const featureCollection = randomPolygon(1);
    const featureCollection2 = featureCollection;

    featureCollection.features[0].geometry = null;
    featureCollection2.features[0].geometry = null;

    const result = isFeatureCollectionChanged(featureCollection, featureCollection2);
    assert.equal(result, false);
  });

  test('identical feature collections except sorted incorrectly', function(assert) {
    const featureCollection = randomPolygon(1);
    const featureCollection2 = featureCollection;

    featureCollection.features.reverse();

    const result = isFeatureCollectionChanged(featureCollection, featureCollection2);
    assert.equal(result, false);
  });
});
