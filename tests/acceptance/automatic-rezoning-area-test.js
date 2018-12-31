import { module, test } from 'qunit';
import {
  visit,
  click,
  isSettled,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import random from '@turf/random';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';

const { randomPolygon } = random;

module('Acceptance | automated rezoning area geometry', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  test('after adding new feature to underlying zoning, rezoningArea has valid geometry', async function(assert) {
    // create a dummy project without rezoning geometries
    this.server.create('project', { needsRezoning: true, needProjectArea: false });
    const store = this.owner.lookup('service:store');

    // visit the underlying zoning editing page
    await visit('/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');
    await isSettled();

    const model = store.peekRecord('project', 1);
    // add a random polygon to the underlying zoning
    const geometricProp = model.get('geometricProperties')
      .findBy('geometryType', 'underlyingZoning');

    const underlyingZoning = randomPolygon(5);
    geometricProp.set('proposedGeometry', underlyingZoning);

    await isSettled();

    // save underlying zoning features
    await click('[data-test-project-geometry-save]');
    await isSettled();

    // rezoningArea should not have a null geom
    // this confirms that that setRezoningArea diffed the zoning features and created a new polygon
    assert.ok(model.get('rezoningArea.features.firstObject.geometry'));
  });

  test('change to zoning label triggers rezoningArea calculation and includes entire zoning polygon', async function(assert) {
    // create a dummy project without rezoning geometries
    this.server.create('project', { needsRezoning: true });

    const store = this.owner.lookup('service:store');

    // visit the underlying zoning editing page
    await visit('/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');
    const model = store.peekRecord('project', 1);
    const geometricProp = model.get('geometricProperties')
      .findBy('geometryType', 'underlyingZoning');

    const underlyingZoning = randomPolygon(5);
    geometricProp.set('proposedGeometry', underlyingZoning);

    // save underlying zoning features
    await click('[data-test-project-geometry-save]');
    await isSettled();
    // rezoningArea should not have a null geom
    // this confirms that that setRezoningArea diffed the zoning features and created a new polygon
    assert.ok(model.get('rezoningArea.features.firstObject.geometry'));
  });
});
