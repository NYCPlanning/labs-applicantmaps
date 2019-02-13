import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import { developmentSiteLayer } from './project-geometries/types/development-site';
import { projectAreaLayer } from './project-geometries/types/project-area';
import projectGeometryIcons from '../utils/project-geom-icons';

const mapEditingLayerGroups = {
  'layer-groups': [
    {
      id: 'tax-lots',
      visible: true,
      layers: [
        { tooltipable: true, highlightable: true, tooltipTemplate: '{{address}} (BBL: {{bbl}})' },
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

@tagName('')
export default class ProjectGeometryEditComponent extends Component {
  constructor(...args) {
    super(...args);

    this.loadLayerGroups();
  }

  @argument
  model;

  @argument
  type;

  @argument
  mode;

  @service
  notificationMessages;

  @service store;

  @service
  router;

  projectGeometryIcons = projectGeometryIcons;

  developmentSiteLayer = developmentSiteLayer;

  projectAreaLayer = projectAreaLayer;

  /* ----------  General Map  ---------- */
  layerGroups = null;

  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
  }

  @action
  rollbackChanges() {
    this.get('model').rollbackAttributes();
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    map.addControl(navigationControl, 'top-left');

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 150,
        duration: 0,
      });
    }

    const basemapLayersToHide = [
      'highway_path',
      'highway_minor',
      'highway_major_casing',
      'highway_name_other',
      'highway_name_motorway',
      'railway_transit',
      'railway_transit_dashline',
    ];

    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
  }

  loadLayerGroups() {
    const store = this.get('store');
    store.query('layer-group', mapEditingLayerGroups).then((allLayerGroups) => {
      const { meta } = allLayerGroups;
      const layerGroups = allLayerGroups;

      this.set('layerGroups', {
        layerGroups,
        meta,
      });
    });
  }
}
