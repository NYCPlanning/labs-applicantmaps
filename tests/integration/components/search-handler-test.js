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

  // hooks.beforeEach(async function() {
  //   this.map = await createMap();

  //   this.owner.register('component:labs-search', Component.extend({
  //     'data-test-labs-search': true,
  //     click() {
  //       this.onSelect(randomPoint(1).features[0]);
  //     },
  //   }));

  //   this.owner.register('component:labs-bbl-lookup', Component.extend({
  //     'data-test-labs-bbl-lookup': true,
  //     click() {
  //       this.flyTo(randomPoint(1).features[0].geometry.coordinates, 12);
  //     },
  //   }));
  // });

  // hooks.after(async function() {
  //   this.map.remove();
  // });

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
