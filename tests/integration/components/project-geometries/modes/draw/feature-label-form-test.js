import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const dummyFeature = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        label: 'someLabel',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [
              -73.95060539245605,
              40.78847003749051,
            ],
            [
              -73.94845962524413,
              40.78847003749051,
            ],
            [
              -73.94845962524413,
              40.79002965177114,
            ],
            [
              -73.95060539245605,
              40.79002965177114,
            ],
            [
              -73.95060539245605,
              40.78847003749051,
            ],
          ],
        ],
      },
    },
  ],
};

module('Integration | Component | project-geometries/modes/draw/feature-label-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{project-geometries/modes/draw/feature-label-form}}`);

    assert.ok(this);
  });

  test('it populates a powerselect when passed an options array', async function(assert) {
    this.set('selectedFeature', dummyFeature);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
        options=(array 'Option 1' 'Option 2' 'Option 3')
      }}
    `);

    // click to open the powerselect list
    await click('.ember-power-select-trigger');

    // make sure the first option's text matches the options that were passed in
    assert.equal(find('.ember-power-select-option').textContent.trim(), 'Option 1');
  });

  test('it renders an input when not passed an options array', async function(assert) {
    this.set('selectedFeature', dummyFeature);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
      }}
    `);

    // make sure the first option's text matches the options that were passed in
    assert.equal(find('[data-test-feature-label-form]').value, 'someLabel');
  });
});
