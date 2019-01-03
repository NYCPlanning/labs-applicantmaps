import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | project-geometries/types', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    this.server.create('project');
    const store = this.owner.lookup('service:store');
    const project = await store.findRecord('project', 1);
    this.set('model', project);

    await render(hbs`
      <div id="geometry-type-draw-explainer"></div>
      {{project-geometries/types type='developmentSite' mode='lots' model=model}}
    `);

    assert.ok(this);
  });
});
