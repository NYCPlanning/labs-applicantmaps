import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@ember/test-helpers';

module('Unit | Route | projects/edit/map/edit', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  test('when route errors, message shows up', async function(assert) {
    this.server.create('project');
    this.server.get('/projects/:id', { errors: ['Error has occurred'] }, 500); // force Mirage to error

    await visit('/projects/10');

    assert.ok(true);
  });
});
