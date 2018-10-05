import { module, test } from 'qunit';
import {
  visit,
  click,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';
import mapboxGlDrawReady from '../helpers/mapbox-gl-draw-ready';
import plotVerticies from '../helpers/plot-verticies';

module('Acceptance | user can click three geom types', function(hooks) {
  setupApplicationTest(hooks);

  test('User can click development site button', async function(assert) {
    await visit('/projects/new');

    await mapboxGlLoaded();
    await click('.draw-control-development-site');
    await click('.draw-control-cancel');

    assert.equal(currentURL(), '/projects/new');
  });

  test('Project area button is available only after user draws development site', async function(assert) {
    await visit('/projects/new');

    await mapboxGlLoaded();
    await click('.draw-control-development-site');
    // make sure .draw-control-project-area is not available
    assert.dom('.draw-control-project-area').doesNotExist();

    await mapboxGlDrawReady();

    await plotVerticies(
      [
        [550, 388],
        [590, 444],
        [604, 369],
        [604, 369],
      ],
    );

    await click('.draw-control-done');

    await click('.draw-control-project-area');

    assert.equal(currentURL(), '/projects/new');
  });
});
