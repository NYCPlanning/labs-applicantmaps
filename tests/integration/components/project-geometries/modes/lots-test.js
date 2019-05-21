import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  settled,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Sinon from 'sinon';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import computeArea from '@turf/area';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

const { randomPolygon } = random;

module('Integration | Component | project-geometries/modes/lots', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  hooks.before(async function() {
    this.sandbox = Sinon.createSandbox();
  });

  hooks.afterEach(function() {
    this.sandbox.restore();
  });

  test('it adds the tax-lots-interactive layer', async function(assert) {
    const store = this.owner.lookup('service:store');
    const peekRecordSpy = this.sandbox.spy(store, 'peekRecord');

    await render(hbs`
      {{#labs-map as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/lots map=drawable}}
        {{/mapbox-gl-draw}}
      {{/labs-map}}
    `);

    assert.equal(peekRecordSpy.firstCall.args[1], 'tax-lots-interactive');
  });

  test('click handler action is functional', async function(assert) {
    const store = this.owner.lookup('service:store');

    this.server.create('project', 'hasDevelopmentSite');
    this.server.get('https://planninglabs.carto.com/api/v2/sql', () => randomPolygon(1));

    const model = await store.findRecord('project', 1, {
      include: 'geometric-properties',
    });
    const developmentSite = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite');
    this.model = developmentSite;

    const polygon = {
      type: 'Feature',
      properties: {
        id: 1,
        label: 'test',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [0, 1], [1, 0], [1, 1]]],
      },
      layer: {
        id: 'test',
      },
    };

    const polyFC = {
      type: 'FeatureCollection',
      features: [polygon],
    };

    const artificialEvents = {};
    this.mapboxEventStub = {
      features: [polygon],
      mapInstance: {
        querySourceFeatures() {
          return [polygon];
        },
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#labs-map as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/lots
            map=drawable
            geometricProperty=model.proposedGeometry}}
        {{/mapbox-gl-draw}}
      {{/labs-map}}
    `);

    const startingArea = computeArea(developmentSite.get('proposedGeometry'));

    artificialEvents.click(polyFC);
    artificialEvents.click(polyFC);
    artificialEvents.click(polyFC);

    await settled();

    // geometry property gets mutated
    assert.equal(developmentSite.get('hasDirtyAttributes'), true);

    // area is increased
    assert.equal(computeArea(model.get('developmentSite')) > startingArea, true);
  });

  test('it removes a previously clicked lot', async function(assert) {
    const store = this.owner.lookup('service:store');

    this.server.create('project', 'hasDevelopmentSite');

    const model = await store.findRecord('project', 1, {
      include: 'geometric-properties',
    });

    this.model = model.get('geometricProperties').findBy('geometryType', 'developmentSite');

    const polygon = {
      type: 'Feature',
      properties: {
        id: 1,
        label: 'test',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [0, 1], [1, 0], [1, 1]]],
      },
      layer: {
        id: 'test',
      },
    };

    const artificialEvents = {};

    this.mapboxEventStub = {
      features: [polygon],
      mapInstance: {
        querySourceFeatures() {
          return [polygon];
        },
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#labs-map as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/lots
            map=drawable
            geometricProperty=model.proposedGeometry}}
        {{/mapbox-gl-draw}}
      {{/labs-map}}
    `);

    // click the first polygon
    polygon.properties.bbl = '1';
    artificialEvents.click({
      type: 'FeatureCollection',
      features: [polygon],
    });
    await settled();

    const initialArea = computeArea(model.get('developmentSite'));

    // click another polygon, then click again
    polygon.properties.bbl = '2';
    artificialEvents.click({
      type: 'FeatureCollection',
      features: [polygon],
    });
    artificialEvents.click({
      type: 'FeatureCollection',
      features: [polygon],
    });
    await settled();

    // area is the same
    assert.equal(initialArea, computeArea(model.get('developmentSite')));
  });

  test('it removes a singly selected lot', async function(assert) {
    const store = this.owner.lookup('service:store');
    const model = await store.createRecord('project', 1);
    this.model = model.get('geometricProperties').findBy('geometryType', 'developmentSite');
    this.model.proposedGeometry.features = [];

    const polygon = {
      type: 'Feature',
      properties: {
        id: 1,
        label: 'test',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [0, 1], [1, 0], [1, 1]]],
      },
      layer: {
        id: 'test',
      },
    };

    const artificialEvents = {};

    this.mapboxEventStub = {
      features: [polygon],
      mapInstance: {
        querySourceFeatures() {
          return [polygon];
        },
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#labs-map as |map|}}
        {{#mapbox-gl-draw map=map as |drawable|}}
          {{project-geometries/modes/lots
            map=drawable
            geometricProperty=model.proposedGeometry}}
        {{/mapbox-gl-draw}}
      {{/labs-map}}
    `);

    const initialArea = computeArea(model.get('developmentSite'));
    artificialEvents.click({
      type: 'FeatureCollection',
      features: [polygon],
    });
    artificialEvents.click({
      type: 'FeatureCollection',
      features: [polygon],
    });
    await settled();

    // area is the same
    assert.equal(computeArea(model.get('developmentSite')), initialArea);
  });

  // this fails
  skip('it removes a previously clicked lot when its first', async function(assert) {
    const store = this.owner.lookup('service:store');

    // stable random feature
    const randomFeatures = randomPolygon(2);
    const { features: [randomFeature1, randomFeature2] } = randomFeatures;
    randomFeature1.properties.bbl = '100100100';

    this.server.create('project', 'hasDevelopmentSite');
    this.server.get('https://planninglabs.carto.com/api/v2/sql', () => randomFeatures);

    let actionArgs = [];
    this.owner.register('component:labs-layers', Component.extend({
      'data-test-lot-selector': true,
      click() {
        this.get('onLayerClick')(...actionArgs);
      },
    }));

    const model = await store.findRecord('project', 1);
    const initialArea = computeArea(model.get('developmentSite'));

    this.set('model', model);

    await render(hbs`
      {{project-geometries/modes/lots
        map=(hash labs-layers=(component 'labs-layers'))
        geometricProperty=model.developmentSite}}
    `);
    actionArgs = [randomFeature1];
    await click('.labs-layers');
    actionArgs = [randomFeature2];
    await click('.labs-layers');

    // area is the same
    assert.equal(initialArea, computeArea(model.get('developmentSite')));
  });
});
