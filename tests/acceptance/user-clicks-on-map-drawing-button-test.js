import { module, skip } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';
import mapboxGlDrawReady from '../helpers/mapbox-gl-draw-ready';
import plotVerticies from '../helpers/plot-verticies';

module('Acceptance | user clicks on map drawing button', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  skip('user clicks on map drawing button', async function(assert) {
    server.createList('project', 10);
    await visit('/projects/new');

    await fillIn('.project-name-field', 'ASDF');
    await fillIn('.applicant-name-field', 'ASDF');
    await fillIn('.zap-project-id-field', 'ASDF');
    await fillIn('.zap-project-description-field', 'Fill out description');

    await mapboxGlLoaded();

    await click('.draw-control-development-site');

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

    await click('.project-save-button');

    assert.equal(currentURL(), '/projects/11');
  });
});
