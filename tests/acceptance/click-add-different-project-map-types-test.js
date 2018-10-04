import { module, test } from 'qunit';
import {
  visit,
  click,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | user can click to add different project map types', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user can click to add different project map types', async (assert) => {
    server.createList('project', 10);

    await visit('/projects/10');
    await click('.map-type-area-map');

    assert.equal(currentURL(), '/projects/10/edit/map/new?mapType=area-map');
  });
});
