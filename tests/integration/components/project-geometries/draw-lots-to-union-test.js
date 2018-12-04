import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries/draw-lots-to-union', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`
      {{#mapbox-gl as |map|}} 
        {{project-geometries/draw-lots-to-union map=map}}
      {{/mapbox-gl}}
    `);

    assert.ok(this);
  });
});
