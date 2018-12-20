import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Controller | application', (hooks) => {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.before(async function() {
    this.map = await createMap();
  });

  hooks.after(function() {
    this.map.remove();
  });

  // Replace this with your real tests.
  test('Application Controller !', function (assert) {
    this.server.create('project');
    const { map } = this;

    this.set('mapObject', {
      mapInstance: map,
    });

    const controller = this.owner.lookup('controller:application');

    controller.send('handleMapLoad', map);
    assert.ok(controller.get('mapInstance'));
  });
});
