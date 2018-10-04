import { module, test } from 'qunit';
import {
  visit,
  click,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | user clicks edit project button and sees new url', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user clicks edit project button and sees new url', async (assert) => {
    server.createList('project', 10);

    await visit('/projects/10');
    await click('.edit-project-button');

    assert.equal(currentURL(), '/projects/10/edit');
  });
});
