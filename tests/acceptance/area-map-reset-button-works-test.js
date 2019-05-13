import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';
import Component from '@ember/component';

import { classNames } from '@ember-decorators/component';

module('Acceptance | area map reset button works', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('reset button fits map to bounds, triggers reset bounds on data changes', async function(assert) {
    this.server.create('project');
    assert.expect(9);
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

    this.mapboxEventStub = {
      mapInstance: {
        resize() {
          assert.ok(true);
        },
      },
    };

    await visit('/projects/1/edit/map/edit');

    await click('[data-test-paper-orientation-portrait]');
    await click('[data-test-paper-paper-size-letter]');
    await click('[data-test-project-area-buffer-400]');
    await click('[data-test-reset-map]');
  });
});
