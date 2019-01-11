import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries/utils/annotations-renderer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('features', { type: 'FeatureCollection', features: [] });

    await render(hbs`{{project-geometries/utils/annotations-renderer annotations=features}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
