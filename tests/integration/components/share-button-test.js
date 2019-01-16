import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ShareButtonComponent from 'labs-applicant-maps/components/share-button';

module('Integration | Component | share-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it displays the default label', async function(assert) {
    await render(hbs`{{share-button}}`);
    assert.equal(find('[data-test-share-message]').textContent.trim(), 'Share project');
  });

  test('it displays a custom label', async function(assert) {
    this.set('label', 'foo');
    await render(hbs`{{share-button label=label}}`);
    assert.equal(find('[data-test-share-message]').textContent.trim(), 'Share foo');
  });

  test('copy-button integration', async function(assert) {
    this.owner.register('component:share-button', ShareButtonComponent.extend({
      'data-test-project-share-button': true,
      click() {
        this.handleShareSuccess();
        this.handleShareError();
      },
    }));

    await render(hbs`{{share-button}}`);
    await click('[data-test-project-share-button]');

    assert.ok(true);
  });
});
