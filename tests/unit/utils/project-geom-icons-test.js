import projectGeomIcons from 'labs-applicant-maps/utils/project-geom-icons';
import { module, test } from 'qunit';

module('Unit | Utility | project-geom-icons', function() {
  test('it exports an object with well-known properties', function(assert) {
    const { developmentSiteIcon } = projectGeomIcons;
    assert.ok(developmentSiteIcon);
  });
});
