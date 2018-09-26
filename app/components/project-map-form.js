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
            { tooltipable: true, tooltipTemplate: '{{address}} (BBL: {{bbl}})' },
            {},
            { style: { layout: { 'text-field': '{numfloors}' } } },
          ],
        },
        {
          id: 'zoning-districts',
          visible: true,
          layers: [
            { highlightable: false, tooltipable: false },
            { tooltipable: false },
          ],
        },
        {
          id: 'street-centerlines',
          visible: true,
          layers: [
            {},
            {
              before: 'place_country_major',
              style: {
                id: 'citymap-street-centerlines-line',
                type: 'line',
                source: 'digital-citymap',
                'source-layer': 'street-centerlines',
                metadata: {
                  'nycplanninglabs:layergroupid': 'street-centerlines',
                },
                minzoom: 13,
                paint: {
                  'line-dasharray': [
                    5,
                    3,
                  ],
                  'line-color': 'rgba(193, 193, 193, 1)',
                  'line-width': 0.5,
                },
              },
            },
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
