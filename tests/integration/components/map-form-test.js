import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';
import hbs from 'htmlbars-inline-precompile';
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

module('Integration | Component | map-form', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  hooks.beforeEach(async function() {
    this.owner.register('component:labs-layers', LabsLayers);
  });

  test('unchecking Lock Interactions allows interaction on the map', async function(assert) {
    this.server.create('project', 1);
    assert.expect(1);

    this.mapboxEventStub = {
      mapInstance: {
        boxZoom: {
          enable() {
            assert.ok(true);
          },
        },
      },
    };

    const store = this.owner.lookup('service:store');
    // const currentMapService = this.owner.lookup('service:mock-map-service');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });
    const applicantMap = store.createRecord('area-map', { project: model });
    this.set('model', applicantMap);

    await render(hbs`{{map-form model=model}}`);
    await click('[data-test-map-form-lock]');
  });
});
