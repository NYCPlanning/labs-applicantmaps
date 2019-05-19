import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { fake } from 'sinon';
import { defaultMapboxEventStub } from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';

module('Unit | Component | map-form/inset-map', function(hooks) {
  setupTest(hooks);

  test('it does not attempt to resize the map if no mapInstance exists', function(assert) {
    const component = this.owner.factoryFor('component:map-form/inset-map').create();

    // set up mocks
    const resizeMap = fake();
    component.resizeMap = resizeMap;

    // update boundsPolygon (triggers resize observer -- assume this "just works" b/c it is ember feature)
    component.set('boundsPolygon', {
      type: 'Polygon',
      coordinates: [[
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]],
    });

    // because map object not set in component, resizeMap should not be called
    assert.equal(resizeMap.callCount, 0);
  });

  test('it does resize the map if mapInstance exists', async function(assert) {
    const component = this.owner.factoryFor('component:map-form/inset-map').create();

    // set up mocks
    const resizeMap = fake();
    component.resizeMap = resizeMap;

    // set up component with initial value for boundsPolygon and map
    component.set('boundsPolygon', {
      type: 'Polygon',
      coordinates: [[
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]],
    });
    const map = defaultMapboxEventStub.mapInstance;
    component.handleMapLoad(map);

    // update boundsPolygon (triggers resize observer -- assume this "just works" b/c it is ember feature)
    component.set('boundsPolygon', {
      type: 'Polygon',
      coordinates: [[
        [0, 0],
        [10, 0],
        [0, 10],
        [0, 0],
      ]],
    });

    // because we have set the map, resizeMap should be called when boundsPolygon is updated
    assert.equal(resizeMap.callCount, 1);
  });
});
