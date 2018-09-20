import Component from '@ember/component';
import { service } from '@ember-decorators/service';

export default class ProjectMapFormComponent extends Component {
  constructor(...args) {
    super(...args);

    const store = this.get('store');
    store.query('layer-group', {
      'layer-groups': [
        {
          id: 'tax-lots',
          visible: true,
          layers: [
            { tooltipable: true, tooltipTemplate: '{{address}}; BBL: {{bbl}}' },
            {},
            { style: { layout: { 'text-field': '{numfloors}' } } },
          ],
        },
      ],
    }).then((layerGroups) => {
      const { meta } = layerGroups;

      this.set('model', {
        layerGroups,
        meta,
      });
    });
  }

  @service store;

  model = null;
}
