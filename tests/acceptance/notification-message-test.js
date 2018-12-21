import { module, skip } from 'qunit';
import {
  visit,
  currentURL,
  // fillIn,
  // click,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | notification message', function(hooks) {
  setupApplicationTest(hooks);

  skip('visiting /notification-message', async function(assert) {
    await visit('/projects/13/edit/development-site');
    assert.equal(currentURL(), '/');
  });
});
