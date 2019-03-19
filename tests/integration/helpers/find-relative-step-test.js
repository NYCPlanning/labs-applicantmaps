import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | find-relative-step', function(hooks) {
  setupRenderingTest(hooks);

  test('it finds the right step with only route', async function(assert) {
    this.set('inputValue', { route: 'projects.edit.steps.development-site' });

    await render(hbs`
      {{#let (find-relative-step inputValue) as |step|}}
        {{step.step}}
      {{/let}}
    `);

    assert.equal(this.element.textContent.trim(), 'development-site');
  });

  test('it finds the right step with qps', async function(assert) {
    this.set('inputValue', {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'project-area',
    });

    await render(hbs`
      {{#let (find-relative-step inputValue) as |step|}}
        {{step.step}}
      {{/let}}
    `);

    assert.equal(this.element.textContent.trim(), 'project-area-create');
  });

  test('it finds the very last (dashboard) step', async function(assert) {
    this.set('inputValue', {
      route: 'projects.show',
    });

    await render(hbs`
      {{#let (find-relative-step inputValue) as |step|}}
        {{step.step}}
      {{/let}}
    `);

    assert.equal(this.element.textContent.trim(), 'dashboard');
  });

  test('it applies an offset', async function(assert) {
    this.set('inputValue', {
      route: 'projects.show',
    });

    await render(hbs`
      {{#let (find-relative-step inputValue -1) as |step|}}
        {{step.step}}
      {{/let}}
    `);

    assert.equal(this.element.textContent.trim(), 'complete');
  });
});
