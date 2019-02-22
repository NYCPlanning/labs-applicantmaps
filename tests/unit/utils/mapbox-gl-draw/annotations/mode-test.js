import { roundLength, toDisplayFeatures } from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/mode';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Utility | mapbox-gl-draw/annotation-mode', function(hooks) {
  setupTest(hooks);
  test('it rounds lengths as expected', function (assert) {
    const dataProvider = [
      { raw: 0, rounded: 0 },
      { raw: 1, rounded: 0 },
      { raw: 2, rounded: 0 },
      { raw: 3, rounded: 5 },
      { raw: 4, rounded: 5 },
      { raw: 5, rounded: 5 },
      { raw: 6, rounded: 5 },
      { raw: 7, rounded: 5 },
      { raw: 8, rounded: 10 },
      { raw: 9, rounded: 10 },
      { raw: 12.3, rounded: 10 },
      { raw: 123.4, rounded: 125 },
      { raw: 1234.5, rounded: 1235 },
      { raw: 12345.6, rounded: 12345 },
      { raw: 123456.7, rounded: 123455 },
      { raw: 1234567.8, rounded: 1234570 },
      { raw: 12345678.9, rounded: 12345680 },
    ];

    dataProvider.forEach(({ raw, rounded }) => {
      const result = roundLength(raw);
      assert.equal(result, rounded);
    });
  });

  test('it adds rounded length label', function (assert) {
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [10, 10]],
      },
      properties: {},
    };

    const state = {
      line: {
        id: 1,
        properties: {},
      },
      direction: 'forward',
    };

    const display = function() {};

    toDisplayFeatures(state, geojson, display);
    assert.ok(geojson.properties.label);
  });
});
