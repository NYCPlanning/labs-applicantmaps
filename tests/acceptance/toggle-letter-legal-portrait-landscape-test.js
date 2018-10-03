import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  find,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';
import mapboxGlDrawReady from '../helpers/mapbox-gl-draw-ready';
import plotVerticies from '../helpers/plot-verticies';

module('Acceptance | user can toggle between letter/legal and portrait/landscape', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user can toggle between letter/legal and portrait/landscape', async (assert) => {
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
    await click('.map-type-area-map');
    await mapboxGlLoaded();

    await click('.portrait-radio-button');
    const isPaperOrientationPortrait = find('.portrait');
    assert.equal(!!isPaperOrientationPortrait, true);

    await click('.letter-radio-button');
    const isPaperSizeLetter = find('.letter');
    assert.equal(!!isPaperSizeLetter, true);

    await click('.landscape-radio-button');
    const isPaperOrientationLandscape = find('.landscape');
    assert.equal(!!isPaperOrientationLandscape, true);

    await click('.tabloid-radio-button');
    const isLetterSizeTabloid = find('.tabloid');
    assert.equal(!!isLetterSizeTabloid, true);
  });
});
