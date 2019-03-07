import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';

const { randomPolygon } = random;

module('Unit | Model | geometric property', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const project = store.createRecord('project', {});
    const model = store.createRecord('geometric-property', {
      geometryType: 'developmentSite',
      proposedGeometry: randomPolygon(1),
      project,
    });

    assert.ok(model);
  });

  test('it splits up a feature collcetion passed to the "data" attr', async function(assert) {
    const store = this.owner.lookup('service:store');
    const project = store.createRecord('project', {});
    const model = store.createRecord('geometric-property', {
      geometryType: 'developmentSite',
      proposedGeometry: randomPolygon(1),
      project,
    });

    model.set('data', {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          'meta:mode': 'draw_annotations:linear',
          label: '29 ft',
        },
        geometry: {
          coordinates: [
            [
              -73.91311260409391,
              38.75817100752687,
            ],
            [
              -73.91314440749528,
              40.75808962172928,
            ],
          ],
          type: 'LineString',
        },
      }],
    });

    assert.equal(model.get('annotations.features.firstObject.properties.label'), '729587.9 ft');
  });
});
