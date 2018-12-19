import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | user can share the project', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // this.server.createList('layer-group', 10);
    // this.server.create('layer-group', { id: 'tax-lots' });

    // let onLayerClick;
    // this.owner.register('component:labs-layers', LabsLayers.extend({
    //   init(...args) {
    //     this._super(...args);

    //     onLayerClick = this.get('onLayerClick');
    //   },
    //   'data-test-labs-layers': true,
    //   click() {
    //     const randomFeature = randomPolygon(1).features[0];
    //     randomFeature.properties.bbl = faker.random.uuid();
    //     onLayerClick(randomFeature);
    //   },
    // }));

    // this.owner.register('component:labs-map', LabsMap.extend({
    //   init(...args) {
    //     this._super(...args);

    //     if (config.environment === 'test') {
    //       registerWaiter(() => this.map);
    //     }
    //   },
    // }));
  });

  test('User can share project', async function(assert) {
    await visit('/projects/10');

    await click('[data-test-share]');
    await click('[data-test-share-copy]');
    await click('[data-test-share-email]');

    assert.equal(currentURL(), '/projects/1/edit/development-site');
  });
});
