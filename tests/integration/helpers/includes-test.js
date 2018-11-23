import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | includes', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('haystack', ['grapes', 'peaches', 'bananas']);
    this.set('needle', 'peaches');

    await render(hbs`{{includes haystack needle}}`);

    assert.equal(this.element.textContent.trim(), 'true');
  });
});
