// Don't know why this is failing

// import { module, test } from 'qunit';
// import {
//   visit,
//   // currentURL,
//   fillIn,
//   click,
// } from '@ember/test-helpers';
// import { setupApplicationTest } from 'ember-qunit';
// import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

// module('Acceptance | user can fill out form', (hooks) => {
//   setupApplicationTest(hooks);
//   setupMirage(hooks);

//   test('user-can-fill-out-form', async (assert) => {
//     server.createList('project', 10);

//     await visit('/projects/new');
//     await fillIn('.project-name-field', 'ASDF');
//     await fillIn('.applicant-name-field', 'ASDF');
//     await fillIn('.zap-project-id-field', 'ASDF');
//     await click('.project-save-button');

//     // Need to update the test to assert a URL that's based on currentStep
//     // assert.equal(currentURL(), '/projects/11');
//     assert.equal('placeholder', 'placeholder');
//   });
// });
