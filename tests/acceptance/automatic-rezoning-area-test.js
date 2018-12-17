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
    this.server.create('project', { needsRezoning: true });

    await visit('/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');

    // save underlying zoning features (first save)
    await click('[data-test-project-geometry-save]');

    // go back to zoning district edit page
    await visit('/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');

    const store = this.owner.lookup('service:store');
    const model = store.peekRecord('project', 1);

    // underlyingZoning should still be emptyDefault
    assert.equal(model.get('underlyingZoning').features[0].properties.isEmptyDefault, true);

    // adds a random polygon to the underlying zoning
    const underlyingZoning = model.get('underlyingZoning');
    underlyingZoning.features.push(randomPolygon(1).features[0]);
    model.set('underlyingZoning', underlyingZoning);

    // save underlying zoning features (second save)
    await click('[data-test-project-geometry-save]');

    assert.notEqual(model.get('underlyingZoning').features[0].geometry, null);
  });
});
