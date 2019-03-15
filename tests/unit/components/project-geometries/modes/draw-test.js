import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentFeatureIsComplete } from 'labs-applicant-maps/components/project-geometries/modes/draw';

const unlabeledPolygon = {
  geometry: {
    type: 'Polygon',
  },
  properties: {
  },
};

const labeledPolygon = {
  geometry: {
    type: 'Polygon',
  },
  properties: {
    label: 'test-label',
  },
};

module('Unit | Component | project-geometries/modes/draw', function(hooks) {
  setupTest(hooks);

  test('currentFeatureIsComplete returns true for modes other than direct_select_rezoning', function(assert) {
    const result = currentFeatureIsComplete('simple_select', unlabeledPolygon);
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns true for empty features', function(assert) {
    const result = currentFeatureIsComplete('direct_select_rezoning');
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns true for polygons with labels in direct_select_rezoning mode', function(assert) {
    const result = currentFeatureIsComplete('direct_select_rezoning', labeledPolygon);
    assert.ok(result);
  });

  test('currentFeatureIsComplete returns false for polygons without labels in direct_select_rezoning mode', function(assert) {
    const result = currentFeatureIsComplete('direct_select_rezoning', unlabeledPolygon);
    assert.notOk(result);
  });
});
