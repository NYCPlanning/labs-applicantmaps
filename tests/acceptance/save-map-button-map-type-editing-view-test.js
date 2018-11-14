// No longer necessary with refactor

// import { module, test } from 'qunit';
// import {
//   visit,
//   click,
//   currentURL,
// } from '@ember/test-helpers';
// import { setupApplicationTest } from 'ember-qunit';
// import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

// import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';

// module('Acceptance | user can click save map button from edit screen', function(hooks) {
//   setupApplicationTest(hooks);
//   setupMirage(hooks);

//   test('user can click save map button from edit screen', async (assert) => {
//     server.createList('project', 10);

//     await visit('/projects/10');
//     await click('.edit-project-button');
//     await mapboxGlLoaded();
//     await click('.project-save-button');

//     assert.equal(currentURL(), '/projects/10');
//   });
// });
