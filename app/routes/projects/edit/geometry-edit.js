import Route from '@ember/routing/route';

const mapEditingLayerGroups = {
  'layer-groups': [
    {
      id: 'tax-lots',
      visible: true,
      layers: [
        {
          highlightable: true,
          clickable: false,
          tooltipable: true,
          tooltipTemplate: '{{address}} (BBL: {{bbl}})',
        },
        {},
        { style: { layout: { 'text-field': '{lot}' } } },
        {
          style: {
            id: 'block-labels',
            type: 'symbol',
            source: 'pluto',
            'source-layer': 'block-centroids',
            minzoom: 14,
            maxzoom: 24,
            layout: {
              'text-field': '{block}',
              'text-font': [
                'Open Sans Bold',
                'Arial Unicode MS Regular',
              ],
              'text-size': 22,
            },
            paint: {
              'text-halo-color': 'rgba(255, 255, 255, 0.5)',
              'text-halo-width': 1,
              'text-color': 'rgba(121, 121, 121, 1)',
              'text-halo-blur': 0,
              'text-opacity': {
                stops: [
                  [
                    14,
                    0,
                  ],
                  [
                    15,
                    1,
                  ],
                ],
              },
            },
          },
        },
      ],
    },
    {
      id: 'zoning-districts',
      visible: true,
      layers: [
        {
          highlightable: false,
          tooltipable: false,
          style: {
            paint: {
              'fill-opacity': 0,
            },
          },
        },
        {
          tooltipable: false,
          style: {
            paint: {
              'line-opacity': 0.05,
            },
          },
        },
        {
          style: {
            paint: {
              'text-opacity': 0,
            },
          },
        },
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
};

export default class GeometryEditRoute extends Route {
  queryParams = {
    mode: { replace: true },
    type: { replace: true },
    target: { replace: true },
  };

  async model() {
    const layerGroups = await this.store.query('layer-group', mapEditingLayerGroups);
    const project = this.modelFor('projects.edit');
    const { meta } = layerGroups;

    return {
      layerGroups: {
        meta,
        layerGroups,
      },
      project,
    };
  }
}
