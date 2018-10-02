import { module, test } from 'qunit';
import {
  visit,
  click,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';

module('Acceptance | user can click three geom types', function(hooks) {
  setupApplicationTest(hooks);

  test('User can click three geom types', async function(assert) {
    await visit('/projects/new');
    await mapboxGlLoaded();
    await click('.draw-control-development-site');
    await click('.draw-control-cancel');

    await click('.draw-control-project-area');
    await click('.draw-control-cancel');

    await click('.draw-control-rezoning-area');
    await click('.draw-control-cancel');

    assert.equal(currentURL(), '/projects/new');
  });
});
