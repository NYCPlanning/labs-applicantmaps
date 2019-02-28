import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { faker } from 'ember-cli-mirage';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import LabsLayers from 'labs-applicant-maps/components/labs-layers';
import DrawMode from 'labs-applicant-maps/components/project-geometries/modes/draw';

const { randomPolygon } = random;

module('Acceptance | polygon labels required for progress', function(hooks) {
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
      // use shiftKey as a switch for drawing polygon with / without label
      click({ shiftKey }) {
        let randomFeatures = randomPolygon(1);
        if (shiftKey) {
          randomFeatures = randomPolygon(1, true);
        }
        this.set('geometricProperty', randomFeatures);
      },
    }));
  });


  test('cannot save polygon without label', async function(assert) {
    // set up project and select to do rezoning edits
    await visit('/');
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    // draw rezoning polygon w/out label
    await click('[data-test-draw-mock]');

    // click save button (should fail)
    await click('[data-test-project-geometry-save]');

    // assert save was a noop (we're still editing underlying zoning
    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');
  });

  test('can save polygon with label', async function(assert) {
    // set up project and select to do rezoning edits
    await visit('/');
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');
    await click('[data-test-labs-layers]');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    // draw rezoning polygon w/ label
    await click('[data-test-draw-mock]', { shiftKey: true });

    // click save button
    await click('[data-test-project-geometry-save]');

    // assert save was successful (we progressed to commercial overlay edit)
    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=commercial-overlays');
  });
});
