import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, pauseTest } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | user can fill out form', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user-can-fill-out-form', async function(assert) {
    server.createList('project', 10);
    window.XMLHttpRequestFake = window.XMLHttpRequest;
    await visit('/projects/new');
    await fillIn('.project-name-field', 'ASDF');
    await fillIn('.applicant-name-field', 'ASDF');
    await fillIn('.zap-project-id-field', 'ASDF');
    await click('.project-save-button');

    assert.equal(currentURL(), '/projects/11/edit');
  });
});
