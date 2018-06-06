import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | projects/edit/maps/area', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:projects/edit/maps/area');
    assert.ok(route);
  });
});
