import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometries', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);

  test('it renders', async function(assert) {
    this.server.createList('layer-group', 10);
    this.server.create('project');

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1);

    this.set('model', model);

    await render(hbs`
      {{project-geometries model=model}}
    `);

    assert.ok(this.element.textContent);
  });
});
