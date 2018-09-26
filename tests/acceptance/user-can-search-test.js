import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | user can search', function(hooks) {
  setupApplicationTest(hooks);

  test('User can start new project and search for something', async function(assert) {
    await visit('/');
    await click('.get-started');
    await fillIn('.map-search-input', '120 broadway');

    assert.equal(currentURL(), '/projects/new');
  });
});
