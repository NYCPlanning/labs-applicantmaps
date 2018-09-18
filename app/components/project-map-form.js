import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import turfBbox from 'npm:@turf/bbox';

export default class ProjectMapFormComponent extends Component {
  constructor() {
    super(...arguments);

    const store = this.get('store');
    store.query('layer-group', {
      'layer-groups': [
        {
          id: 'tax-lots',
          visible: true,
          layers: [
            { tooltipable: false },
            {},
            { style: { layout: { 'text-field': '{numfloors}' } } }
          ]
        },
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
}
