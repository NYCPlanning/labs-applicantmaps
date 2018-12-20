import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  waitUntil,
  typeIn,
  clearRender,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import { DefaultDraw } from 'labs-applicant-maps/components/project-geometries/modes/draw';
import Sinon from 'sinon';

module('Integration | Component | project-geometries/modes/draw', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  hooks.before(async function() {
    this.map = await createMap();
    this.draw = new DefaultDraw();
  });

  hooks.beforeEach(function() {
    this.sandbox = Sinon.createSandbox();
  });

  hooks.after(function() {
    this.map.remove();
  });

  test('it switches to draw mode', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const { map, draw } = this;

    this.set('geometricProperty', model.get('developmentSite'));
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{project-geometries/modes/draw
        map=mapObject
        geometricProperty=geometricProperty}}
    `);

    await click('.polygon');

    assert.equal(draw.getMode(), 'draw_polygon');
  });

  test('it deletes selected polygon', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const { map, draw } = this;

    this.set('model', model);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{project-geometries/modes/draw
        map=mapObject
        geometricProperty=model.developmentSite}}
    `);

    const { features: [{ id }] } = draw.getAll();

    draw.changeMode('direct_select', { featureId: id });

    await waitUntil(() => map.loaded(), { timeout: 15000 });
    await click('.trash');

    assert.equal(model.get('developmentSite').features.length, 0);
  });

  test('it updates the draw layer label', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const { map, draw } = this;

    this.set('model', model);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#project-geometries/modes/draw
        map=mapObject
        geometricProperty=model.developmentSite as |draw|}}
        {{draw.feature-label-form
          selectedFeature=model.developmentSite}}
      {{/project-geometries/modes/draw}}
    `);

    const { features: [{ id }] } = draw.getAll();

    draw.changeMode('direct_select', { featureId: id });
    await waitUntil(() => map.loaded(), { timeout: 15000 });
    await typeIn('[data-test-feature-label-form]', 'test');

    assert.equal(model.developmentSite.features[0].properties.label, 'test');
  });

  test('events are properly torn down across subsequent renders', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const { map, draw } = this;

    this.set('geometricProperty', model.get('developmentSite'));
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    const drawGetAllSpy = this.sandbox.spy(draw, 'getAll');

    await render(hbs`
      {{project-geometries/modes/draw
        map=mapObject
        geometricProperty=geometricProperty}}
    `);

    const { features: [{ id }] } = draw.getAll();

    draw.changeMode('direct_select', { featureId: id });

    assert.equal(drawGetAllSpy.callCount, 2);

    await clearRender();

    await render(hbs`
      {{project-geometries/modes/draw
        map=mapObject
        geometricProperty=geometricProperty}}
    `);

    draw.changeMode('direct_select', { featureId: id });

    await clearRender();

    await render(hbs`
      {{project-geometries/modes/draw
        map=mapObject
        geometricProperty=geometricProperty}}
    `);

    draw.changeMode('direct_select', { featureId: id });

    assert.equal(drawGetAllSpy.callCount, 4);
  });
});
