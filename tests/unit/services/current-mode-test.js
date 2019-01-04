import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-mode', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:current-mode');
    assert.ok(service);
  });
});
