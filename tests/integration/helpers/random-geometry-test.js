import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';

const { randomPolygon } = random;

module('Integration | Helper | random-geometry', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  skip('it renders', async function(assert) {
    let poly = randomPolygon(1);
    assert.ok(poly);

    poly = randomPolygon(2);
    assert.ok(poly);

    poly = randomPolygon(5);
    assert.ok(poly);
  });
});
