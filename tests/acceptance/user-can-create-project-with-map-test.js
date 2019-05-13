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
import Component from '@ember/component';

import { classNames } from '@ember-decorators/component';

module('Acceptance | user can create project with map', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('User can create new project', async function(assert) {
    // stub in the labs layers consumer component
    @classNames('labs-layers')
    class LabsLayers extends Component {
      onLayerClick = () => {};

      map = {};

      click() {
        this.onLayerClick({ properties: {} });
      }
    }

    this.owner.register('component:labs-layers', LabsLayers);

    await visit('/');

    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await fillIn('[data-test-new-project-applicant-name]', 'David Lynch');
    await fillIn('[data-test-new-project-project-number]', 'Winkies');
    await click('[data-test-create-new-project]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');

    await click('[data-test-select-lots]');

    await click('.labs-layers');
    await click('.labs-layers');
    await click('.labs-layers');

    await click('[data-test-project-geometry-save]');

    assert.equal(currentURL(), '/projects/1/edit/project-area');

    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');

    await click('.labs-layers');
    await click('.labs-layers');
    await click('.labs-layers');

    await click('[data-test-project-geometry-save]');

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
      },
    };

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
});
