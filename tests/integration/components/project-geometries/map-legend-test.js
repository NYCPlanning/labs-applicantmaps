import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';

module('Integration | Component | project-geometries/map-legend', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{project-geometries/map-legend}}`);

    assert.equal(this.element.textContent.trim(), '');
  });


  test('it displays development site legend', async function(assert) {
    this.set('model', {
      developmentSite: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[0, 0], [1, 1], [2, 2]],
          },
        }],
      },
    });

    await render(hbs`
      {{project-geometries/map-legend
        type='development-site'
        model=model}}
    `);

    assert.ok(find('[data-test-legend-item="development-site"]'));
  });
});
