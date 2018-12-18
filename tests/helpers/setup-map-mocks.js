import { registerWaiter } from '@ember/test';
import LabsMap from 'ember-mapbox-composer/components/labs-map';
import Service, { inject as service } from '@ember/service';

export default async function(hooks) {
  hooks.beforeEach(function() {
    this.owner.register('service:mock-map-service', Service.extend({
      init(...args) {
        this._super(...args);
        this.set('maps', []);
      },
    }));

    this.owner.register('component:labs-map', LabsMap.extend({
      mockMapService: service(),
      init(...args) {
        this._super(...args);
        this.get('mockMapService.maps').pushObject(this);
        registerWaiter(() => this.map);
      },
    }));
  });
}
