import { registerWaiter } from '@ember/test';
import LabsMap from 'ember-mapbox-composer/components/labs-map';
import Service, { inject as service } from '@ember/service';

export default function(hooks) {
  hooks.beforeEach(async function() {
    this.owner.register('service:mock-map-service', Service.extend({
      init(...args) {
        this._super(...args);
        this.set('maps', new Map());
      },
    }));

    this.owner.register('component:labs-map', LabsMap.extend({
      mockMapService: service(),
      init(...args) {
        this._super(...args);

        this.get('mockMapService.maps').set(this.elementId, this);
        registerWaiter(() => this.map);
      },
    }));
  });
}
