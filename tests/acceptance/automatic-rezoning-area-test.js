import { module, test } from 'qunit';
import {
  visit,
  click,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import random from '@turf/random';

const { randomPolygon } = random;

module('Acceptance | Automated Rezoning Area Geometry', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('After adding new feature to underlying zoning, rezoningArea has valid geometry', async function(assert) {
    // create a dummy project without rezoning geometries
    this.server.create('project', { needsRezoning: true });

    const store = this.owner.lookup('service:store');

    // visit the underlying zoning editing page
    await visit('/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');
    const model = store.peekRecord('project', 1);

    // rezoningArea should still be emptyDefault
    assert.equal(model.get('rezoningArea').features[0].properties.isEmptyDefault, true);

    // add a random polygon to the underlying zoning
    const underlyingZoning = model.get('underlyingZoning');
    underlyingZoning.features.push(randomPolygon(1).features[0]);
    model.set('underlyingZoning', underlyingZoning);

    // save underlying zoning features
    await click('[data-test-project-geometry-save]');

    // rezoningArea should not have a null geom
    // this confirms that that setRezoningArea diffed the zoning features and created a new polygon
    assert.notEqual(model.get('rezoningArea').features[0].geometry, null);
  });
});
