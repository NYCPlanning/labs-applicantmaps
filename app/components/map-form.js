import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import turfBbox from 'npm:@turf/bbox';

const defaultLayerGroups = {
  'layer-groups': [
    {
      id: 'building-footprints',
      visible: true,
      layers: [
        {
          style: {
            paint: {
              'fill-opacity': 0.35,
              'fill-color': '#505050',
            },
          },
        },
      ],
    },
    {
      id: 'tax-lots',
      visible: true,
      layers: [
        {
          style: {
            paint: { 'fill-opacity': 0.7 },
            minzoom: 8,
          },
          tooltipable: false,
        },
        {},
        { style: { layout: { 'text-field': '{numfloors}' } } },
      ],
    },
    { id: 'subway', visible: true },
    { id: 'special-purpose-districts', visible: false },
    { id: 'citymap', visible: true },
    { id: 'street-direction-arrows', visible: true },
    { id: 'commercial-overlay-patterns', visible: true },
  ],
};

export default class AreaMapFormComponent extends Component {
  constructor(...args) {
    super(...args);

    const query = this.get('customLayerGroupQuery') || defaultLayerGroups;
    const store = this.get('store');
    store.query('layer-group', query).then((layerGroups) => {
      const { meta } = layerGroups;

      this.set('model', {
        layerGroups,
        meta,
      });
    });
  }

  @argument customLayerGroupQuery = null;

  @service store;

  model = null;

  // TODO for some reason I have to pass in the projectArea instead
  // of just calling this.get('projectAreaSource') ('this' is not available in the action)
  @action
  handleMapLoad(projectArea, map) { // eslint-disable-line
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 100,
    });
  }
}
