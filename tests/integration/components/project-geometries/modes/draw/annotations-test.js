import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries/modes/draw/annotations', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    this.set('myAction', () => {});

    await render(hbs`
      <div class="draw-controls" id="draw-controls"></div>
      {{project-geometries/modes/draw/annotations handleAnnotation=(action myAction)}}
    `);

    assert.ok(this);

    // Template block usage:
    await render(hbs`
      <div class="draw-controls" id="draw-controls"></div>
      {{#project-geometries/modes/draw/annotations handleAnnotation=(action myAction)}}
        template block text
      {{/project-geometries/modes/draw/annotations}}
    `);

    assert.ok(this);
  });
});
