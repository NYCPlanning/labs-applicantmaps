import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Integration | Component | project-geometries/rezoning-area', function(hooks) {
  setupRenderingTest(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  // TODO: this test is a wash, needs to be rewritten
  // code is commented out to provide hints as to what the writer was trying
  // to do in the first place
  skip('it renders', async function() {
    // Set any properties with this.set('myProperty', 'value');
    // // Handle any actions with this.set('myAction', function(val) { ... });

    // const dummyFeatureCollection = EmptyFeatureCollection;

    // dummyFeatureCollection.features[0].geometry = {
    //   type: 'Point',
    //   coordinates: [0, 0],
    // };

    // const store = this.owner.lookup('service:store');
    // const model = store.createRecord('project', {
    //   rezoningArea: dummyFeatureCollection,
    // });

    // this.model = model;

    // await render(hbs`
    //   <div id='geometry-type-draw-explainer'></div>
    //   {{#mapbox-gl}}
    //     <div class="labs-map-loaded"></div>
    //     {{project-geometries/types/rezoning-area
    //       map=map
    //       model=model
    //       mode='lots'}}
    //   {{/mapbox-gl}}
    // `);

    // const newData = Object.assign(EmptyFeatureCollection, {
    //   features: [{
    //     type: 'Feature',
    //     geometry: {
    //       type: 'Point',
    //       coordinates: [0, 0],
    //     },
    //   }],
    // });

    // model.set('rezoningArea', Object.assign(newData));

    // await click('[data-test-project-geometry-save]');

    // assert.ok(model);
  });
});
