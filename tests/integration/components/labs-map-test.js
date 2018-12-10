import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';

module('Integration | Component | labs-map', function(hooks) {
  setupRenderingTest(hooks);

  hooks.before(async function() {
    this.map = await createMap();
  });

  test('it renders', async function(assert) {
    // Template block usage:
    await render(hbs`
      {{#labs-map}}
        <div class='did-load'></div>
      {{/labs-map}}
    `);

    assert.ok(find('.did-load'));
  });
});
