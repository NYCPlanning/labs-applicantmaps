import areaMapLegendConfig from 'labs-applicant-maps/utils/area-map-legend-config';
import { module, test } from 'qunit';

module('Unit | Utility | area-map-legend-config', function() {
  test('it simply exports some configuration data', function(assert) {
    const result = areaMapLegendConfig;
    assert.ok(result);
  });
});
