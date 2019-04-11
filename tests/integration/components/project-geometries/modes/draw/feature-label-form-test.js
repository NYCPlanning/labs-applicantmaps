import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  fillIn,
} from '@ember/test-helpers';
import { spy } from 'sinon';
import hbs from 'htmlbars-inline-precompile';

const dummyPointFeature = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        label: 'someLabel',
      },
      geometry: {
        type: 'Point',
        coordinates: [-73.95060539245605, 40.78847003749051],
      },
    },
  ],
};
const dummyPolygonFeature = {
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
    this.set('selectedFeature', dummyPolygonFeature);

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
    this.set('selectedFeature', dummyPolygonFeature);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
      }}
    `);

    // make sure the first option's text matches the options that were passed in
    assert.equal(find('[data-test-feature-label-form]').value, 'someLabel');
  });

  test('it updates expected features on polygon label selection', async function(assert) {
    this.set('selectedFeature', dummyPolygonFeature);

    const updateSelectedFeatureSpy = spy();
    this.set('updateSelectedFeature', updateSelectedFeatureSpy);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
        updateSelectedFeature=updateSelectedFeature
        options=(array 'Option 1' 'Option 2' 'Option 3')
      }}
    `);

    // click to open the powerselect list
    await click('.ember-power-select-trigger');

    // click the third option in the list
    await click('.ember-power-select-option:nth-of-type(3)');

    assert.ok(updateSelectedFeatureSpy.calledWith('label', 'Option 3'));
    assert.ok(updateSelectedFeatureSpy.calledWith('textFont', 'bold'));
  });

  test('it toggles textFont property when bold box is clicked', async function(assert) {
    this.set('selectedFeature', dummyPointFeature);

    const updateSelectedFeatureSpy = spy();
    this.set('updateSelectedFeature', updateSelectedFeatureSpy);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
        updateSelectedFeature=updateSelectedFeature
      }}
    `);

    // toggle the bold button
    await click('[data-test-bold-button]');
    await click('[data-test-bold-button]');

    assert.ok(updateSelectedFeatureSpy.getCall(0).calledWith('textFont', 'bold'));
    assert.ok(updateSelectedFeatureSpy.getCall(1).calledWith('textFont', 'default'));
  });

  test('it toggles textSize property when large box is clicked', async function(assert) {
    this.set('selectedFeature', dummyPointFeature);

    const updateSelectedFeatureSpy = spy();
    this.set('updateSelectedFeature', updateSelectedFeatureSpy);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
        updateSelectedFeature=updateSelectedFeature
      }}
    `);

    // toggle the bold button
    await click('[data-test-large-button]');
    await click('[data-test-large-button]');

    assert.ok(updateSelectedFeatureSpy.getCall(0).calledWith('textSize', 'large'));
    assert.ok(updateSelectedFeatureSpy.getCall(1).calledWith('textSize', 'default'));
  });

  test('it adds new label that user typed in', async function(assert) {
    this.set('selectedFeature', dummyPolygonFeature);

    const updateSelectedFeatureSpy = spy();
    this.set('updateSelectedFeature', updateSelectedFeatureSpy);

    await render(hbs`
      {{project-geometries/modes/draw/feature-label-form
        selectedFeature=selectedFeature
        updateSelectedFeature=updateSelectedFeature
        options=(array 'Option 1' 'Option 2' 'Option 3')
      }}
    `);

    // click to open the powerselect list
    await click('.ember-power-select-trigger');

    // click on search box and type new option to "add"
    await click('.ember-power-select-search');
    await fillIn('.ember-power-select-search-input', 'Option 4');
    // there will be only one option available
    assert.equal(find('.ember-power-select-option').textContent.trim(), 'Add "Option 4"...');
    await click('.ember-power-select-option');

    // make sure that the polygon now has the new label that the user typed in
    assert.ok(updateSelectedFeatureSpy.calledWith('label', 'Option 4'));
    assert.ok(updateSelectedFeatureSpy.calledWith('textFont', 'bold'));
  });
});
