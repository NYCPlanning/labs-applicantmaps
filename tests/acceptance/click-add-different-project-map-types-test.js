import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import mapboxGlLoaded from '../helpers/mapbox-gl-loaded';
import mapboxGlDrawReady from '../helpers/mapbox-gl-draw-ready';
import plotVerticies from '../helpers/plot-verticies';

module('Acceptance | user can click to add different project map types', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('user can click to add different project map types', async (assert) => {
    server.createList('project', 10);

    await visit('/projects/10');
    await click('.map-type-area-map');

    assert.equal(currentURL(), '/projects/11/edit/map/new?mapType=area-map');
  });
});
