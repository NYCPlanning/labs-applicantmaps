import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { EmptyFeatureCollection } from 'labs-applicant-maps/models/project';

module('Integration | Component | project-geometries/modes/draw', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('geometricProperty', EmptyFeatureCollection);

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{project-geometries/modes/draw
          map=map
          geometricProperty=geometricProperty}}
      {{/mapbox-gl}}
    `);

    assert.equal(this.element.textContent.trim(), '');
  });
});
