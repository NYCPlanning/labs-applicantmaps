import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | project-geometries/commercial-overlays', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('error message shows up', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.server.create('project');
    this.server.get('/projects/:id', { errors: ['Error has occurred'] }, 500); // force mirage to errors

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{project-geometries/types/commercial-overlays map=map}}
      {{/mapbox-gl}}
    `);

    assert.ok(true);
  });
});
