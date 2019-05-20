import { module, test, skip } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  settled,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Acceptance | back button works', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  hooks.beforeEach(async function() {
    const triangle = {
      type: 'Feature',
      properties: {
        id: 1,
        label: 'test',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 1], [0, 1], [1, 0], [1, 1]]],
      },
      layer: {
        id: 'test',
      },
    };

    this.triangleFC = {
      type: 'FeatureCollection',
      features: [triangle],
    };

    this.currentMapboxStubReturnValue = {
      type: 'FeatureCollection',
      features: [],
    };

    this.artificialEvents = {};
    this.mapboxEventStub = {
      draw: {
        add: () => {},
        set: () => {},
        getAll: () => this.currentMapboxStubReturnValue,
        getSelected: () => this.currentMapboxStubReturnValue,
        getSelectedIds: () => [1],
        getMode: () => 'simple_select',
        changeMode: () => {},
      },
      mapInstance: {
        on: (event, func) => {
          this.artificialEvents[event] = func;
        },
        querySourceFeatures() {
          return [triangle];
        },
      },
    };
  });

  test('back button when model is dirty should nav to appropriate Q', async function(assert) {
    await visit('/');

    // go through sequence up until project area
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();

    this.artificialEvents.click(this.triangleFC);
    await settled();

    this.artificialEvents.click(this.triangleFC);
    await settled();
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();

    this.artificialEvents.click(this.triangleFC);
    await settled();

    this.artificialEvents.click(this.triangleFC);
    await settled();
    await click('[data-test-geometry-edit-back=""]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');
  });

  test('being able to click "Next" when you already have a geom and havent made any changes', async function(assert) {
    await visit('/');

    // go through sequence up until project area
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();
    await click('[data-test-project-geometry-save]');
    await click('[data-test-step-back=""]');
    await click('[data-test-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();
    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');
  });

  test('move back from a rezoning area', async function(assert) {
    await visit('/');

    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');

    await click('[data-test-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');

    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');


    this.artificialEvents.click(this.triangleFC);
    await settled();
    await click('[data-test-project-geometry-save]');

    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');
    this.currentMapboxStubReturnValue = this.triangleFC;
    this.artificialEvents['draw.create']();
    await settled();

    await click('[data-test-project-geometry-save]');
    await click('[data-test-geometry-edit-back=""]');

    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');

    await click('[data-test-project-geometry-save]');


    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=commercial-overlays');

    await click('[data-test-project-geometry-save]');
    await click('[data-test-geometry-edit-back=""]');

    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=underlying-zoning');

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=commercial-overlays');

    this.currentMapboxStubReturnValue = this.triangleFC;
    this.artificialEvents['draw.create']();
    await settled();

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=special-purpose-districts');

    this.currentMapboxStubReturnValue = this.triangleFC;
    this.artificialEvents['draw.create']();
    await settled();


    await click('[data-test-geometry-edit-back=""]');
    await click('[data-test-project-geometry-save]');

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/complete');

    await click('[data-test-go-to-dash]');

    assert.equal(currentURL(), '/projects/1');
  });

  // address this in a later issue
  skip('move back from project area question to development site & can click "next"', async function(assert) {
    await visit('/');

    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');

    await click('[data-test-select-lots]');

    this.artificialEvents.click(this.triangleFC);
    await settled();

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');

    await click('[data-test-step-back=""]');
    await click('[data-test-select-lots]');
    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');
  });
});
