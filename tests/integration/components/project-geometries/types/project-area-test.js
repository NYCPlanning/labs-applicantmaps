import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const DUMMY_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [0, 0],
    },
  }],
};

module('Integration | Component | project-geometries/project-area', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  skip('make sure button appears when model is dirty', async function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'Mulholland Drive',
    }));

    await model.save();

    this.set('model', model);

    await render(hbs`
      {{!-- EMBER WORMHOLE CONTAINER --}}
      {{!-- The geometry type component will fill this div with markup once invoked --}}
      <div id="geometry-type-draw-explainer">
      </div>

      {{!-- EMBER WORMHOLE CONTAINER --}}
      <div id="geometry-type-save-box">
      </div>

      {{#mapbox-gl as |map|}} 
        <div class="labs-map-loaded"></div>
        {{project-geometries/types/project-area
          map=map
          mode='lots'
          map=map
          model=model}}
      {{/mapbox-gl}}
    `);

    assert.equal(this.element.querySelector('[data-test-project-geometry-save]').disabled, true);

    await model.set('developmentSite', DUMMY_FEATURE_COLLECTION);
    await settled();

    assert.equal(this.element.querySelector('[data-test-project-geometry-save]').disabled, false);
  });
});
