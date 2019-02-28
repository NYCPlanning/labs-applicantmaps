import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { faker } from 'ember-cli-mirage';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import LabsLayers from 'labs-applicant-maps/components/labs-layers';
import DrawMode from 'labs-applicant-maps/components/project-geometries/modes/draw';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';

const { randomPolygon } = random;

module('Acceptance | back button works', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  hooks.beforeEach(async function() {
    this.server.createList('layer-group', 10);
    this.server.create('layer-group', { id: 'tax-lots' });

    let onLayerClick;
    this.owner.register('component:labs-layers', LabsLayers.extend({
      init(...args) {
        this._super(...args);

        onLayerClick = this.get('onLayerClick');
      },
      'data-test-labs-layers': true,
      click() {
        const randomFeature = randomPolygon(1).features[0];
        randomFeature.properties.bbl = faker.random.uuid();
        onLayerClick(randomFeature);
      },
    }));

    this.owner.register('component:project-geometries/modes/draw', DrawMode.extend({
      'data-test-draw-mock': true,
      click() {
        const randomFeatures = randomPolygon(1);
        this.set('geometricProperty', randomFeatures);
      },
    }));
  });

  test('back button when model is dirty should nav to appropriate Q', async function(assert) {
    await visit('/');

    // go through sequence up until project area
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-geometry-edit-back=""]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');
  });
});
