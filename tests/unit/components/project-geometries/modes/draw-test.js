import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentFeatureIsComplete } from 'labs-applicant-maps/components/project-geometries/modes/draw';

module('Unit | Component | project-geometries/modes/draw', function(hooks) {
  setupTest(hooks);

  test('currentFeatureIsComplete returns true for modes other than direct_select', function(assert) {
    const result = currentFeatureIsComplete('simple_select');
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns true for empty features', function(assert) {
    const result = currentFeatureIsComplete('direct_select');
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns true for polygons with labels in direct_select mode', function(assert) {
    const labeledPolygon = {
      geometry: {
        type: 'Polygon',
      },
      properties: {
        label: 'test-label',
      },
    };

    const result = currentFeatureIsComplete('direct_select', labeledPolygon);
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns false for polygons without labels in direct_select mode', function(assert) {
    const unlabeledPolygon = {
      geometry: {
        type: 'Polygon',
      },
      properties: {
      },
    };

    const result = currentFeatureIsComplete('direct_select', unlabeledPolygon);
    assert.notOk(result);
  });
});
