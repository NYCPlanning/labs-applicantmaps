import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | route-history', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:route-history');
    assert.ok(service);
  });
});
