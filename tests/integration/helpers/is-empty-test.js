import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | is-empty', function(hooks) {
  setupRenderingTest(hooks);

  test('it is truthy for an empty string', async function(assert) {
    this.set('inputValue', '');

    await render(hbs`{{if (is-empty inputValue) 'true' 'false'}}`);

    assert.equal(this.element.textContent.trim(), 'true');
  });

  test('it is falsy for a string', async function(assert) {
    this.set('inputValue', '1234');

    await render(hbs`{{if (is-empty inputValue) 'true' 'false'}}`);

    assert.equal(this.element.textContent.trim(), 'false');
  });

  test('it is truthy for an empty FeatureCollection', async function(assert) {
    this.set('inputValue', {
      type: 'FeatureCollection',
      features: [],
    });

    await render(hbs`{{if (is-empty inputValue) 'true' 'false'}}`);

    assert.equal(this.element.textContent.trim(), 'true');
  });

  test('it is falsy for a FeatureCollection with Features', async function(assert) {
    this.set('inputValue', {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: {
            type: 'Point',
            coordinates: [
              -74.008712,
              40.712914,
            ],
          },
        },
        properties: {
          foo: 'bar',
        },
      }],
    });

    await render(hbs`{{if (is-empty inputValue) 'true' 'false'}}`);

    assert.equal(this.element.textContent.trim(), 'false');
  });
});
