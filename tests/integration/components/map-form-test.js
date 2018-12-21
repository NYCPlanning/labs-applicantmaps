import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import hbs from 'htmlbars-inline-precompile';
import MapForm from 'labs-applicant-maps/components/map-form';

module('Integration | Component | map-form', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  hooks.beforeEach(async function() {
    this.owner.register('component:map-form', MapForm.extend({
      actions: {
        handleMapLoaded(map) {
          this.set('mapInstance', map);
          this.fitBoundsToSelectedBuffer();
          this.updateBounds();
          this.toggleMapInteractions();
        },
      },
    }));
  });

  test('unchecking Lock Interactions allows interaction on the map', async function(assert) {
    this.server.createList('layer-group', 10);
    this.server.create('layer-group', { id: 'tax-lots' });
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const currentMapService = this.owner.lookup('service:mock-map-service');
    const model = await store.findRecord('project', 1);
    const applicantMap = store.createRecord('area-map', { project: model });

    this.set('model', applicantMap);

    await render(hbs`{{map-form model=model}}`);
    const mainMap = currentMapService.get('maps').get('main-map').map;
    await click('[data-test-map-form-lock]');

    assert.equal(mainMap.boxZoom.isEnabled(), true);
  });
});
