import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@ember/test-helpers';

module('Unit | Controller | projects/edit/steps/development-site', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('error message shows up', async function(assert) {
    // const controller = this.owner.lookup('controller:projects/edit/steps/development-site');

    this.server.create('project');
    this.server.get('/projects/:id', { errors: ['Error has occurred'] }, 500); // force Mirage to error

    await visit('/projects/10');

    assert.ok(true);
  });
});
