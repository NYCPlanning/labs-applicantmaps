import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, typeIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Integration | Component | search-handler', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`
      {{#mapbox-gl as |map|}} 
        {{search-handler map=map}}
      {{/mapbox-gl}}
    `);

    assert.ok(this.element);
  });

  test('handles a selected result', async function(assert) {
    assert.expect(1);

    this.mapboxEventStub = {
      mapInstance: {
        flyTo() {
          assert.ok(true);
        },
      },
    };

    await render(hbs`
      {{#mapbox-gl as |map|}} 
        {{search-handler map=map}}
      {{/mapbox-gl}}
    `);

    await typeIn('[data-test-search-address=""] input', 'test');
    await click('[data-test-search-address=""] .result');
  });
});
