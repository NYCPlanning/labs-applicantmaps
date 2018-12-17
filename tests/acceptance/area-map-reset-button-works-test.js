import { module, test } from 'qunit';
import { visit, click, getSettledState } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import config from 'labs-applicant-maps/config/environment';
import LabsMap from 'labs-applicant-maps/components/labs-map';
import MapForm from 'labs-applicant-maps/components/map-form';
import MapboxGL from 'labs-applicant-maps/components/mapbox-gl';
import { registerWaiter } from '@ember/test';
import Sinon from 'sinon';

module('Acceptance | area map reset button works', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.sandbox = Sinon.createSandbox();
    this.server.createList('layer-group', 10);
    this.server.create('layer-group', { id: 'tax-lots' });

    const beforeHookScope = this;
    this.owner.register('component:labs-map', LabsMap.extend({
      init(...args) {
        this._super(...args);

        if (config.environment === 'test') {
          registerWaiter(() => this.get('map'));
        }
      },
    }));

    this.owner.register('component:mapbox-gl', MapboxGL.extend({
      init(...args) {
        this._super(...args);

        if (config.environment === 'test') {
          registerWaiter(() => this.map);
        }
      },
    }));

    this.owner.register('component:map-form', MapForm.extend({
      actions: {
        handleMapLoaded(map) {
          this.set('mapInstance', map);
          this.fitBoundsToBuffer();
          this.updateBounds();
          this.toggleMapInteractions();

          beforeHookScope.mapInstance = map;
        },
      },
    }));
  });

  hooks.afterEach(function() {
    this.sandbox.restore();
  });

  test('reset button fits map to bounds, triggers reset bounds on data changes', async function(assert) {
    this.server.create('project');

    await visit('/projects/1/edit/map/edit');
    const fitBoundsSpy = this.sandbox.spy(this.mapInstance, 'fitBounds');
    await click('[data-test-paper-orientation-portrait]');
    await click('[data-test-paper-paper-size-letter]');
    await click('[data-test-project-area-buffer-400]');

    await click('[data-test-reset-map]');

    assert.ok(fitBoundsSpy.callCount, 4);
  });
});
