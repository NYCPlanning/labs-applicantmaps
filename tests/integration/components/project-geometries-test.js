import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('it renders', async function(assert) {
    this.server.create('project');

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);
    const layerGroups = await store.peekAll('layer-group');

    this.set('model', model);
    this.set('layerGroups', layerGroups);

    await render(hbs`
      {{project-geometries
        model=model
        layerGroups=layerGroups
        type='development-site'
        mode='draw'}}
    `);

    assert.ok(this.element.textContent);
  });
});
