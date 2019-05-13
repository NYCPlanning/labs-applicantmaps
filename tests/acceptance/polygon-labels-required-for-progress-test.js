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

@classNames('labs-layers')
class LabsLayers extends Component {
  onLayerClick = () => {};

  map = {};

  click() {
    this.onLayerClick({ properties: {} });
  }
}

module('Acceptance | polygon labels required for progress', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  hooks.beforeEach(async function() {
    this.polygon = {
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

    this.polygonFC = {
      type: 'FeatureCollection',
      features: [this.polygon],
    };

    this.currentReturnValue = {
      type: 'FeatureCollection',
      features: [],
    };

    this.artificialEvents = {};
    this.mapboxEventStub = {
      draw: {
        add: () => {},
        set: () => {},
        getAll: () => this.currentReturnValue,
        getSelected: () => this.currentReturnValue,
        getSelectedIds: () => [1],
        getMode: () => 'simple_select',
        changeMode: () => {},
      },
      mapInstance: {
        on: (event, func) => {
          this.artificialEvents[event] = func;
        },
      },
    };

    this.owner.register('component:labs-layers', LabsLayers);
  });

  test('cannot save polygon without label', async function(assert) {
    // set up project and select to do rezoning edits
    await visit('/');
    await click('[data-test-get-started]');
    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');
    await click('[data-test-create-new-project]');
    await click('[data-test-select-lots]');
    await click('.labs-layers');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');
    await click('.labs-layers');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    this.polygon.properties.label = '';
    this.currentReturnValue = this.polygonFC;
    this.artificialEvents['draw.create']();
    await settled();

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
    await click('.labs-layers');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-project-area-yes]');
    await click('[data-test-project-area-select-lots]');
    await click('.labs-layers');
    await click('[data-test-project-geometry-save]');
    await click('[data-test-rezoning-yes]');
    await click('[data-test-rezoning-underlying-zoning-yes]');
    await click('[data-test-rezoning-commercial-overlays-yes]');
    await click('[data-test-rezoning-special-purpose-districts-yes]');
    await click('[data-test-alter-zoning]');

    this.currentReturnValue = this.polygonFC;
    this.artificialEvents['draw.create']();
    await settled();

    // click save button
    await click('[data-test-project-geometry-save]');

    // assert save was successful (we progressed to commercial overlay edit)
    assert.equal(currentURL(), '/projects/1/edit/geometry-edit?mode=draw&type=commercial-overlays');
  });
});
