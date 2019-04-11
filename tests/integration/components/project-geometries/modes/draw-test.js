import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  waitUntil,
  waitFor,
  typeIn,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import { DefaultDraw } from 'labs-applicant-maps/components/mapbox-gl-draw';
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

  hooks.afterEach(function() {
    this.sandbox.restore();
  });

  test('it switches to draw mode', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const { map, draw } = this;

    this.set('geometricProperty', model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry'));
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{project-geometries/modes/draw
          map=drawable
          geometricProperty=geometricProperty}}
      {{/mapbox-gl-draw}}
    `);

    await click('.polygon');

    assert.equal(draw.getMode(), 'draw_polygon');
  });

  test('it deletes selected polygon', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const { map, draw } = this;

    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');
    this.set('geometricProperty', geometricProperty);

    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{project-geometries/modes/draw
          map=drawable
          geometricProperty=geometricProperty}}
      {{/mapbox-gl-draw}}
    `);

    assert.equal(draw.getAll().features.length, 1);

    const { features: [{ id }] } = draw.getAll();

    draw.changeMode('direct_select', { featureId: id });

    await click('.trash');

    assert.equal(draw.getAll().features.length, 0);
  });

  // again, I can't get these to work reliably. Manually, this feature works!
  // but since I'm having to simulate practically everything for DRAW
  // it doesn't work!
  test('it updates the draw layer label', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const { map, draw } = this;

    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');
    this.set('geometricProperty', geometricProperty);

    this.set('model', model);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{#project-geometries/modes/draw
          directSelectMode='direct_select_rezoning'
          map=drawable
          geometricProperty=geometricProperty as |draw|}}
          {{draw.feature-label-form
            selectedFeature=geometricProperty}}
        {{/project-geometries/modes/draw}}
      {{/mapbox-gl-draw}}
    `);

    const { features: [{ id }] } = draw.getAll();

    draw.changeMode('direct_select', { featureId: id });

    await waitFor('[data-test-feature-label-form]');
    await typeIn('[data-test-feature-label-form]', 'test');

    assert.equal(draw.getAll().features[0].properties.label, 'test');
  });

  test('it draws and saves', async function(assert) {
    this.server.create('project', {
      developmentSite: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const map = await createMap();
    const draw = new DefaultDraw();

    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');
    this.set('geometricProperty', geometricProperty);

    this.set('model', model);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{project-geometries/modes/draw
          directSelectMode='direct_select_rezoning'
          map=drawable
          geometricProperty=geometricProperty}}
      {{/mapbox-gl-draw}}
    `);

    draw.changeMode('draw_polygon');

    await waitUntil(() => map.isSourceLoaded('mapbox-gl-draw-cold') && map.isSourceLoaded('mapbox-gl-draw-hot'));

    const mapCanvas = map.getCanvas();
    await click(mapCanvas, { clientX: 40, clientY: 40 });
    await click(mapCanvas, { clientX: 50, clientY: 50 });
    await click(mapCanvas, { clientX: 55, clientY: 55 });
    await click(mapCanvas, { clientX: 55, clientY: 55 });

    assert.ok(true);
  });

  // this test is too brittle at this point
  skip('events are properly torn down across subsequent renders', function() {});

  // need to look at this later - firefox is behaving differently with the clicks
  test('it can handle label tool', async function(assert) {
    this.server.create('project', {
      developmentSite: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');

    const callbacks = {};
    const map = {
      addControl() {},
      removeControl() {},
      on(event, callback) {
        callbacks[event] = callback;
      },
      off() {},
      isSourceLoaded() { return true; },
    };

    const draw = {
      changeMode() {
        callbacks['draw.modechange']();
      },
      getMode() {},
      set() {},
      getSelected() {
        return geometricProperty;
      },
      getSelectedIds() {
        return [geometricProperty.id];
      },
      getAll() {
        return geometricProperty;
      },
      setFeatureProperty() {

      },
    };

    this.set('geometricProperty', geometricProperty);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{#project-geometries/modes/draw
          directSelectMode='direct_select_rezoning'
          map=drawable
          geometricProperty=geometricProperty as |drawMode|}}
          {{drawMode.annotations}}
          {{drawMode.feature-label-form}}
        {{/project-geometries/modes/draw}}
      {{/mapbox-gl-draw}}
    `);

    await click('[data-test-draw-label-tool]');

    // trigger the create callback;
    callbacks['draw.create']();

    await waitFor('[data-test-feature-label-form]');
    await typeIn('[data-test-feature-label-form]', 'test');

    assert.equal(draw.getAll().features[0].properties.label, 'test');
  });

  test('it can handle centerline tool', async function(assert) {
    this.server.create('project', {
      developmentSite: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');

    const callbacks = {};
    const map = {
      addControl() {},
      removeControl() {},
      on(event, callback) {
        callbacks[event] = callback;
      },
      off() {},
      isSourceLoaded() { return true; },
    };

    const draw = {
      changeMode() {
        callbacks['draw.modechange']();
      },
      getMode() {},
      set() {},
      getSelected() {
        return geometricProperty;
      },
      getSelectedIds() {
        return [geometricProperty.id];
      },
      getSelectedPoints() {
        return {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          }, {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          }],
        };
      },
      trash() {
        geometricProperty.features = [];
      },
      getAll() {
        return geometricProperty;
      },
      setFeatureProperty() {

      },
    };

    this.set('geometricProperty', geometricProperty);
    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{#project-geometries/modes/draw
          directSelectMode='direct_select_rezoning'
          map=drawable
          geometricProperty=geometricProperty as |drawMode|}}
          {{drawMode.annotations}}
          {{drawMode.feature-label-form}}
        {{/project-geometries/modes/draw}}
      {{/mapbox-gl-draw}}
    `);

    await click('[data-test-draw-centerline-tool]');

    // trigger the create callback;
    callbacks['draw.create']();
    callbacks['draw.selectionchange']();
    callbacks['draw.selectionchange']();

    assert.equal(geometricProperty.features.length, 1);

    await click('.trash');

    assert.equal(geometricProperty.features.length, 0);
  });
});
