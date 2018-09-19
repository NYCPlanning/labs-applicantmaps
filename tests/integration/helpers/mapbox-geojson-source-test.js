import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | mapbox-geojson-source', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', {
      type: 'FeatureCollection',
      features: [],
    });

    await render(hbs`{{get (mapbox-geojson-source inputValue) 'type'}}`);

    assert.equal(this.element.textContent.trim(), 'geojson');
  });
});
