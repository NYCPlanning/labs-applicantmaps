import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | dasherize', function(hooks) {
  setupRenderingTest(hooks);

  test('it dasherizes a camelCase string', async function(assert) {
    this.set('inputValue', 'fooBarBazQux');
    await render(hbs`{{dasherize inputValue}}`);
    assert.equal(this.element.textContent.trim(), 'foo-bar-baz-qux');
  });

  test('it dasherizes a snake_case string', async function(assert) {
    this.set('inputValue', 'foo_bar_baz_qux');
    await render(hbs`{{dasherize inputValue}}`);
    assert.equal(this.element.textContent.trim(), 'foo-bar-baz-qux');
  });

  test('it dasherizes a string with multiple words separated by spaces', async function(assert) {
    this.set('inputValue', 'foo bar baz qux');
    await render(hbs`{{dasherize inputValue}}`);
    assert.equal(this.element.textContent.trim(), 'foo-bar-baz-qux');
  });
});
