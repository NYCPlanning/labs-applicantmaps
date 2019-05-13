import { module, skip } from 'qunit';
import {
  visit,
  click,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';

module('Acceptance | map styles dont leak state', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  skip('visiting /map-styles-dont-leak-state', async function() {
    this.server.createList('layer-group', 10);
    this.server.create('layer-group', { id: 'tax-lots' });

    await visit('/');

    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await fillIn('[data-test-new-project-applicant-name]', 'David Lynch');
    await fillIn('[data-test-new-project-project-number]', 'Winkies');
    await click('[data-test-create-new-project]');
  });
});
