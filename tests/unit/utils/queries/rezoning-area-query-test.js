import queriesRezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import { module, test } from 'qunit';
import { pauseTest } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupTest } from 'ember-qunit';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

const { randomPolygon } = random;
const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {
      isEmptyDefault: true,
    },
  }],
};

module('Unit | Utility | queries/rezoning-area-query', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it returns an object with features property', async function(assert) {
    const project = this.server.create('project');
    this.server.create('geometric-property', {
      geometryType: 'underlyingZoning',
      hasCanonical: true,
      proposedGeometry: randomPolygon(3),
      canonical: randomPolygon(1),
      project,
    });
const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    const result = await queriesRezoningAreaQuery(
      model.get('developmentSite'),
      model.get('geometricProperties'),
    );

    assert.ok(result.features);
  });

  test('it returns an empty FC if there are no proposed geometries', async function(assert) {
    const project = this.server.create('project');
    this.server.create('geometric-property', {
      geometryType: 'underlyingZoning',
      hasCanonical: true,
      proposedGeometry: EmptyFeatureCollection,
      canonical: randomPolygon(1),
      project,
    });

    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    const result = await queriesRezoningAreaQuery(
      model.get('developmentSite'),
      model.get('geometricProperties'),
    );

    assert.equal(isEmpty(result), true);
  });

});
