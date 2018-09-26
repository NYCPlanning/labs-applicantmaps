import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | user can search', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /user-can-search', async function(assert) {
    await visit('/user-can-search');

    assert.equal(currentURL(), '/user-can-search');
  });
});
