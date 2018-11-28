import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, pauseTest } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import mapboxGlLoaded from '../../../helpers/mapbox-gl-loaded';

const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {},
  }],
};

module('Integration | Component | project-geometries/rezoning-area', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    const dummyFeatureCollection = EmptyFeatureCollection;

    dummyFeatureCollection.features[0].geometry = {
      type: 'Point',
      coordinates: [0, 0],
    };

    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      rezoningArea: dummyFeatureCollection,
    }));

    this.set('model', model);

    await render(hbs`
      <div id='geometry-type-draw-explainer'></div>
      {{#mapbox-gl}}
        <div class="labs-map-loaded"></div>
        {{project-geometries/rezoning-area
          map=map
          model=model
          mode='lots'}}
      {{/mapbox-gl}}
    `);

    await mapboxGlLoaded();
    const newData = Object.assign(EmptyFeatureCollection, {
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      }],
    });

    model.set('rezoningArea', Object.assign(newData));

    await click('[data-test-project-geometry-save]');

    assert.ok(model);
  });
});
