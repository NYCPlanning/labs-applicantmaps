import { module, skip } from 'qunit';
import {
  visit,
  click,
  // fillIn,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

// import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';


module('Acceptance | user can search', function(hooks) {
  setupApplicationTest(hooks);

  skip('User can start new project and search for something', async function(assert) {
    await visit('/');
    await click('.get-started');
    // await mapboxGlLoaded();
    // Need to set up a separate test for map load and zoom to feature in the new geometry-edit template
    // await fillIn('.map-search-input', '120 broadway');

    assert.equal(currentURL(), '/projects/new');
  });
});
