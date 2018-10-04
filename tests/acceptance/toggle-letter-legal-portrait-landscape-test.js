import { module, test } from 'qunit';
import {
  visit,
  click,
  find,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';

module('Acceptance | user can toggle between letter/legal and portrait/landscape', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user can toggle between letter/legal and portrait/landscape', async (assert) => {
    server.createList('project', 10);

    await visit('/projects/10');
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
