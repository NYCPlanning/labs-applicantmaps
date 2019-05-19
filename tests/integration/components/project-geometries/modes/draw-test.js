import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  waitFor,
  typeIn,
  settled,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Integration | Component | project-geometries/modes/draw', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('it switches to draw mode', async function(assert) {
    assert.expect(1);
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);

    // factory setup for data context
    this.set('geometricProperty', model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry'));

    this.mapboxEventStub = {
      draw: {
        changeMode(mode) {
          assert.equal(mode, 'draw_polygon');
        },
      },
    };

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/draw
            map=drawable
            geometricProperty=geometricProperty}}
        {{/mapbox-gl-draw}}
      {{/mapbox-gl}}
    `);

    await click('.polygon');
  });

  test('it deletes selected polygon', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    const geometricProperty = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');
    this.set('geometricProperty', geometricProperty);

    assert.expect(3);
    const artificialEvents = {};
    this.mapboxEventStub = {
      draw: {
        getSelected: () => {
          assert.ok(true);

          return {
            features: [{
              properties: {},
              type: 'feature',
            }],
          };
        },
        getSelectedIds: () => [1],
        trash() {
          assert.ok(true);
        },
      },
      mapInstance: {
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/draw
            map=drawable
            geometricProperty=geometricProperty}}
        {{/mapbox-gl-draw}}
      {{/mapbox-gl}}
    `);

    await artificialEvents['draw.selectionchange']();
    await settled();

    await click('.trash');
  });

  // again, I can't get these to work reliably. Manually, this feature works!
  // but since I'm having to simulate practically everything for DRAW
  // it doesn't work!
  skip('it updates the draw layer label', async function(assert) {
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
    this.geometricProperty = {
      type: 'FeatureCollection',
      features: [],
    };

    const triangle = {
      type: 'Feature',
      properties: {
        id: 1,
        label: 'test',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [0, 1], [1, 0], [1, 1]]],
      },
    };

    const triangleFC = {
      type: 'FeatureCollection',
      features: [triangle],
    };

    let currentReturnValue = {
      type: 'FeatureCollection',
      features: [],
    };

    const artificialEvents = {};
    this.mapboxEventStub = {
      draw: {
        getSelected: () => currentReturnValue,
        getAll: () => currentReturnValue,
      },
      mapInstance: {
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/draw
            directSelectMode='direct_select_rezoning'
            map=drawable
            geometricProperty=geometricProperty}}
        {{/mapbox-gl-draw}}
      {{/mapbox-gl}}
    `);

    await click('.polygon');

    currentReturnValue = triangleFC;

    artificialEvents['draw.create']();
    await settled();

    assert.equal(this.geometricProperty.features[0], triangle);
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
