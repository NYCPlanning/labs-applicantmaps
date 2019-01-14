import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  // pauseTest,
  click,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { faker } from 'ember-cli-mirage';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import Sinon from 'sinon';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import computeArea from '@turf/area';

const { randomPolygon } = random;

module('Integration | Component | project-geometries/modes/lots', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.before(async function() {
    this.sandbox = Sinon.createSandbox();
    this.map = await createMap();
  });

  hooks.afterEach(function() {
    this.sandbox.restore();
  });

  hooks.after(function() {
    this.map.remove();
  });

  test('it peeks and returns tax-lots', async function(assert) {
    const store = this.owner.lookup('service:store');

    // push a pluto-fill layer so that the conditionals in the constructor are true
    store.push({
      data: [
        {
          type: 'layer',
          id: 'pluto-fill',
        },
      ],
    });
    const peekRecordSpy = this.sandbox.spy(store, 'peekRecord');

    // make dependent components happy
    this.owner.register('component:labs-layers', Component.extend({}));
    this.owner.register('component:mapbox-gl-source', Component.extend({}));

    await render(hbs`
      {{project-geometries/modes/lots
        map=(hash
          labs-layers=(component 'labs-layers')
          source=(component 'mapbox-gl-source')
        )}}
    `);

    assert.ok(peekRecordSpy.calledTwice, 'peekRecord called once');
    assert.equal(peekRecordSpy.firstCall.args[1], 'pluto-fill');
  });

  test('click handler action is functional', async function(assert) {
    const store = this.owner.lookup('service:store');

    this.server.create('project');
    this.server.get('https://planninglabs.carto.com/api/v2/sql', () => randomPolygon(1));
    this.owner.register('component:labs-layers', Component.extend({
      'data-test-lot-selector': true,
      click() {
        const randomFeature = randomPolygon(1).features[0];
        randomFeature.properties.bbl = faker.random.uuid();

        this.get('onLayerClick')(randomFeature);
      },
    }));

    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const developmentSite = model.get('geometricProperties')
      .findBy('geometryType', 'developmentSite');
    this.set('model', developmentSite);

    await render(hbs`
      {{project-geometries/modes/lots
        map=(hash labs-layers=(component 'labs-layers'))
        geometricProperty=model.proposedGeometry}}
    `);

    const startingArea = computeArea(developmentSite.get('proposedGeometry'));

    await click('[data-test-lot-selector]');
    await click('[data-test-lot-selector]');
    await click('[data-test-lot-selector]');

    // geometry property gets mutated
    assert.equal(developmentSite.get('hasDirtyAttributes'), true);

    // area is increased
    assert.equal(computeArea(model.get('developmentSite')) > startingArea, true);
  });

  test('it removes a previously clicked lot', async function(assert) {
    const store = this.owner.lookup('service:store');

    // stable random feature
    const randomFeatures = randomPolygon(2);
    const { features: [randomFeature1, randomFeature2] } = randomFeatures;
    randomFeature1.properties.bbl = '100100100';

    this.server.create('project');
    this.server.get('https://planninglabs.carto.com/api/v2/sql', () => randomFeatures);
    this.owner.register('component:labs-layers', Component.extend({
      'data-test-lot-selector': true,
      click(options) {
        if (options.clientX === 1) {
          this.get('onLayerClick')(randomFeature1);
        } else {
          this.get('onLayerClick')(randomFeature2);
        }
      },
    }));

    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    this.set('model', model.get('geometricProperties').findBy('geometryType', 'developmentSite'));

    await render(hbs`
      {{project-geometries/modes/lots
        map=(hash labs-layers=(component 'labs-layers'))
        geometricProperty=model.proposedGeometry}}
    `);
    await click('[data-test-lot-selector]', { clientX: 1 });
    const initialArea = computeArea(model.get('developmentSite'));
    await click('[data-test-lot-selector]', { clientX: 2 });
    await click('[data-test-lot-selector]', { clientX: 2 });

    // area is the same
    assert.equal(initialArea, computeArea(model.get('developmentSite')));
  });

  // this fails
  skip('it removes a previously clicked lot when its first', async function(assert) {
    const store = this.owner.lookup('service:store');

    // stable random feature
    const randomFeatures = randomPolygon(2);
    const { features: [randomFeature1, randomFeature2] } = randomFeatures;
    randomFeature1.properties.bbl = '100100100';

    this.server.create('project');
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
    await click('[data-test-lot-selector]');
    actionArgs = [randomFeature2];
    await click('[data-test-lot-selector]');

    // area is the same
    assert.equal(initialArea, computeArea(model.get('developmentSite')));
  });
});
