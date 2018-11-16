import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries/underlying-zoning', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('model', this.server.create('project'));

    await render(hbs`
      {{#mapbox-gl as |map|}} 
        {{project-geometries/underlying-zoning model=model map=map}}
      {{/mapbox-gl}}
    `);

    assert.equal(this.element.textContent.trim(), '');
  });
});
