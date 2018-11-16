import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometry-edit/underlying-zoning', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`
      {{#mapbox-gl as |map|}} 
        {{project-geometry-edit/underlying-zoning map=map}}
      {{/mapbox-gl}}
    `);

    assert.equal(this.element.textContent.trim(), '');
  });
});
