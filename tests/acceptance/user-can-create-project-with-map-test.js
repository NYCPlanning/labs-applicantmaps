import { module, test } from 'qunit';
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

module('Acceptance | user can create project with map', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('User can create new project', async function(assert) {
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

    const triangleFC = {
      type: 'FeatureCollection',
      features: [triangle],
    };

    let currentReturnValue = {
      type: 'FeatureCollection',
      features: [],
    };

    const artificialEvents = {};
    this.mapboxEventStub = {
      draw: {
        add: () => {},
        set: () => {},
        getAll: () => currentReturnValue,
        getSelected: () => currentReturnValue,
        getSelectedIds: () => [1],
        getMode: () => 'simple_select',
        changeMode: () => {},
      },
      mapInstance: {
        on: (event, func) => {
          artificialEvents[event] = func;
        },
        querySourceFeatures() {
          return [triangle];
        },
      },
    };

    await visit('/');
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await fillIn('[data-test-new-project-applicant-name]', 'David Lynch');
    await fillIn('[data-test-new-project-project-number]', 'Winkies');
    await click('[data-test-create-new-project]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');

    await click('[data-test-select-lots]');

    artificialEvents.click(triangleFC);
    await settled();
    artificialEvents.click(triangleFC);
    await settled();
    artificialEvents.click(triangleFC);
    await settled();

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');

    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');

    artificialEvents.click(triangleFC);
    await settled();
    artificialEvents.click(triangleFC);
    await settled();
    artificialEvents.click(triangleFC);
    await settled();

    await click('[data-test-project-geometry-save]');

    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    currentReturnValue = triangleFC;

    await artificialEvents['draw.create']();
    await settled();
    await click('[data-test-project-geometry-save]');

    currentReturnValue = triangleFC;

    await artificialEvents['draw.create']();
    await settled();
    await click('[data-test-project-geometry-save]');

    currentReturnValue = triangleFC;

    await artificialEvents['draw.create']();
    await settled();
    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/complete');

    await click('[data-test-go-to-dash]');

    assert.equal(currentURL(), '/projects/1');

    await click('[data-test-add-area-map]');

    await click('[data-test-paper-orientation-portrait]');
    await click('[data-test-paper-orientation-landscape]');
    await click('[data-test-paper-paper-size-tabloid]');
    await click('[data-test-paper-paper-size-letter]');

    await click('[data-test-project-area-buffer]');
    await click('[data-test-project-area-buffer-400]');
    await click('[data-test-save-map]');

    await click('[data-test-go-back-to-project]');

    assert.equal(currentURL(), '/projects/1');
  });

  test('User can delete geometries from project', async function(assert) {
    assert.expect(1);

    // #create invokes the model factory which includes a development site
    // the second and third arguments to #create are "traits" defined
    // in the factory
    // we override the other properties so that the project is in a valid state
    this.server.create('project', 'hasDevelopmentSite', 'hasProjectArea', {
      needRezoning: false,
      hasCompletedWizard: true,
    });

    // here we intercept the request to the server and assert that the request
    // gets made
    this.server.patch('/projects/1', (schema) => {
      assert.ok(true);

      return schema.projects.first();
    });

    await visit('/projects/1');
    await click('[data-test-delete-project-area]');
  });
});
