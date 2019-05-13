import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Controller | application', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it renders', function (assert) {
    const controller = this.owner.lookup('controller:application');

    assert.ok(controller);
  });
});
