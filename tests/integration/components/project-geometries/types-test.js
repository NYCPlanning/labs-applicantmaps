import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clearRender } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | project-geometries/types', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const project = await store.findRecord('project', 1);
    this.set('model', project);

    await render(hbs`
      <div id="geometry-type-draw-explainer"></div>
      {{project-geometries/types type='developmentSite' mode='lots' model=model}}
    `);

    assert.ok(this);

    project.geometricProperties
      .findBy('geometryType', 'developmentSite')
      .set('proposedGeometry', {
        type: 'FeatureCollection',
        features: [{
          geometry: [{
            type: 'Polygon',
            coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]],
          }],
          type: 'Feature',
        }],
      });

    await clearRender();

    assert.ok(this);
  });
});
