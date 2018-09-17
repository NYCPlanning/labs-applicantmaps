import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import turfBbox from 'npm:@turf/bbox';

export default class AreaMapFormComponent extends Component {
  constructor() {
    super(...arguments);

    const store = this.get('store');
    store.query('layer-group', {
      'layer-groups': [
        { id: 'zoning-districts', visible: true },
        { id: 'tax-lots', visible: true, layers: [{ tooltipable: true }] },
        { id: 'commercial-overlays', visible: true },
      ]
    }).then(layerGroups => {
      const { meta }= layerGroups;

      this.set('model', { 
        layerGroups,
        meta,
      });
    });
  }

  @service store;

  model = null;

  // TODO for some reason I have to pass in the projectArea instead
  // of just calling this.get('projectAreaSource') ('this' is not available in the action)
  @action
  handleMapLoad(projectArea, map) {
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 100,
    });
  }
}
