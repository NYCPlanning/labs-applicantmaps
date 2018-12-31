import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import hbs from 'htmlbars-inline-precompile';

import { EmptyFeatureCollection } from 'labs-applicant-maps/models/project';

module('Integration | Component | project-geometry-renderer', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  hooks.before(async function() {
    this.map = await createMap();
  });

  hooks.after(function() {
    this.map.remove();
  });

  test('it does not render any layers if there are not project geometries set on the model', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const currentMapService = this.owner.lookup('service:mock-map-service');
    const model = await store.findRecord('project', 1);

    model.set('developmentSite', EmptyFeatureCollection);
    model.set('projectArea', EmptyFeatureCollection);
    model.set('rezoningArea', EmptyFeatureCollection);
    model.set('underlyingZoning', EmptyFeatureCollection);
    model.set('commercialOverlays', EmptyFeatureCollection);
    model.set('specialPurposeDistricts', EmptyFeatureCollection);

    this.set('model', model);

    await render(hbs`
      {{#mapbox-gl id='main-map' as |map|}}
        {{project-geometry-renderer map=map model=model}}
      {{/mapbox-gl}}
    `);

    const { map } = currentMapService.get('maps').get('main-map');

    // make sure none of the layer ids associated with our project geometries exist on the map
    assert.notOk(map.getStyle().layers
      .filter(({ id }) => [
        'development-site-line',
        'project-buffer-line',
        'rezoning-area-line',
        'underlying-zoning-line',
        'co_outline',
        'proposed-special-purpose-districts-fill',
      ].includes(id))
      .length);
  });

  test('it renders a developmentSite if one exists on the model', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const currentMapService = this.owner.lookup('service:mock-map-service');
    const model = await store.findRecord('project', 1);

    this.set('model', model);

    await render(hbs`
      {{#mapbox-gl id='main-map' as |map|}}
        {{project-geometry-renderer map=map model=model}}
      {{/mapbox-gl}}
    `);

    const { map } = currentMapService.get('maps').get('main-map');
    assert.ok(map.getStyle().layers.filter(({ id }) => id === 'development-site-line'));
  });
});
