import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import Component from '@ember/component';
import hbs from 'htmlbars-inline-precompile';
import random from 'labs-applicant-maps/mirage/helpers/random-geometry';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';

const { randomPoint } = random;

module('Integration | Component | search-handler', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.map = await createMap();

    this.owner.register('component:labs-search', Component.extend({
      'data-test-labs-search': true,
      click() {
        this.onSelect(randomPoint(1).features[0]);
      },
    }));

    this.owner.register('component:labs-bbl-lookup', Component.extend({
      'data-test-labs-bbl-lookup': true,
      click() {
        this.flyTo(randomPoint(1).features[0].geometry.coordinates, 12);
      },
    }));
  });

  hooks.after(async function() {
    this.map.remove();
  });

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{search-handler}}`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('handles a selected result', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{search-handler map=(hash mapInstance=map)}}`);
    await click('[data-test-labs-search]');

    assert.equal(this.element.textContent.trim(), '');
  });

  test('handles a bbl lookup', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{search-handler map=(hash mapInstance=map)}}`);
    await click('[data-test-labs-bbl-lookup]');

    assert.equal(this.element.textContent.trim(), '');
  });
});
