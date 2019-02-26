import elevateGeojsonIds from 'labs-applicant-maps/utils/elevate-geojson-ids';
import { module, test } from 'qunit';

module('Unit | Utility | elevate-geojson-ids', function() {
  test('it works', function(assert) {
    const testPoly = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        // ...
        properties: {
          id: 'almond',
        },
      }, {
        type: 'Feature',
        // ...
        properties: {
          id: 'walnut',
        },
      }],
    };

    const result = elevateGeojsonIds(testPoly);

    result.features.forEach((feature) => {
      assert.equal(feature.id, feature.properties.id);
    });
  });
});
