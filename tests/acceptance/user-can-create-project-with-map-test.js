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
import random from '@turf/random';
import LabsLayers from 'labs-applicant-maps/components/labs-layers';
import LabsMap from 'labs-applicant-maps/components/labs-map';
import config from 'labs-applicant-maps/config/environment';
import { registerWaiter } from '@ember/test';

const { randomPolygon } = random;

module('Acceptance | user can create project with map', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

    this.owner.register('component:labs-map', LabsMap.extend({
      init(...args) {
        this._super(...args);

        if (config.environment === 'test') {
          registerWaiter(() => this.map);
        }
      },
    }));
  });

  test('User can create new project', async function(assert) {
    await visit('/');

    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await fillIn('[data-test-new-project-applicant-name]', 'David Lynch');
    await fillIn('[data-test-new-project-project-number]', 'Winkies');
    await click('[data-test-create-new-project]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');

    await click('[data-test-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');

    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');

    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');
    await click('[data-test-labs-layers]');

    await click('[data-test-project-geometry-save]');

    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1');
  });
});
