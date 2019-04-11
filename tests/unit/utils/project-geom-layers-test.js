import projectGeomLayers from 'labs-applicant-maps/utils/project-geom-layers';
import { module, test } from 'qunit';

module('Unit | Utility | project-geom-layers', function() {
  test('it exports some data', function(assert) {
    const result = projectGeomLayers;
    assert.ok(result);
    assert.equal(typeof result, 'object');
  });
});
