import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries/utils/button', function(hooks) {
  setupRenderingTest(hooks);

  test('it accepts and triggers a click handler', async function(assert) {
    assert.expect(1);

    this.set('handleClick', function() {
      assert.ok(true);
    });

    await render(hbs`
      {{project-geometries/utils/button
        handleClick=(action handleClick)}}
    `);

    await click('button');
  });

  test('it disables when passed a property', async function(assert) {
    await render(hbs`
      {{project-geometries/utils/button
        enabled=false}}
    `);

    assert.equal(find('button').disabled, true);
  });
});
