import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | projects/edit/map/edit', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:projects/edit/map/edit');
    assert.ok(route);
  });
});
