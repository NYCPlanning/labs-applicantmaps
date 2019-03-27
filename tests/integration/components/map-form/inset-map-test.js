import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';

module('Integration | Component | inset-map', function(hooks) {
  setupRenderingTest(hooks);
  setupMapMocks(hooks);

  test('it contains a mapboxgl-map div', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('boundsPolygon', {
      type: 'Polygon',
      coordinates: [[
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]],
    });

    await render(hbs`{{map-form/inset-map boundsPolygon=this.boundsPolygon}}`);

    // assert inset map is rendered with a mapbox GL 'inset-map' div
    const insetMap = find('#inset-map');
    assert.ok(insetMap);
    assert.ok(insetMap.className.split(' ').includes('mapboxgl-map'));
  });
});
