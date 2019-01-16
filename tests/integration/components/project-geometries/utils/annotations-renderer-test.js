import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const lineFeature = type => ({
  type: 'Feature',
  properties: {
    'meta:mode': `draw_annotations:${type}`,
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [
        -72.49603271484375,
        42.45183466943919,
      ],
      [
        -71.949462890625,
        42.64002037386321,
      ],
    ],
  },
});

module('Integration | Component | project-geometries/utils/annotations-renderer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('features', {
      type: 'FeatureCollection',
      features: [
        lineFeature('linear'),
        lineFeature('curved'),
        lineFeature('square'),
        lineFeature('label'),
      ],
    });

    await render(hbs`{{project-geometries/utils/annotations-renderer annotations=features}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
