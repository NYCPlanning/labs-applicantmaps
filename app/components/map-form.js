import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { next } from '@ember/runloop';
import turfBbox from '@turf/bbox';
import mapboxgl from 'mapbox-gl';
import projectGeomLayers from '../utils/project-geom-layers';

const defaultLayerGroups = {
  'layer-groups': [
    {
      id: 'subway',
      visible: true,
      layers: [
        {}, // subway_green
        {}, // subway_yellow
        {}, // subway_gray
        {}, // subway_brown
        {}, // subway_light_green
        {}, // subway_orange
        {}, // subway_blue
        {}, // subway_purple
        {}, // subway_red
        {}, // subway_stations
        {}, // subway_stations_labels
        {
          style: {
            paint: {
              'circle-stroke-width': 1.5,
            },
          },
        }, // subway_entrances
        {
          style: {
            paint: {
              'text-opacity': 0,
            },
          },
        }, // subway_entrances_labels
      ],
    },
    {
      id: 'tax-lots',
      visible: true,
      layers: [
        {
          style: {
            paint: { 'fill-opacity': 0.5 },
            minzoom: 8,
          },
          tooltipable: false,
          highlightable: false,
        },
        {},
        {
          style: {
            layout: { 'text-field': '{numfloors}' },
            paint: { 'text-color': 'rgba(33, 35, 38, 0.9)' },
          },
        },
      ],
    },
    {
      id: 'building-footprints',
      visible: true,
      layers: [
        {
          style: {
            paint: {
              'fill-opacity': 0.35,
              'fill-color': 'rgba(33, 35, 38, 0)',
              'fill-outline-color': 'rgba(33, 35, 38, 0.8)',
            },
          },
        },
      ],
    },
    { id: 'special-purpose-districts', visible: false },
    {
      id: 'citymap',
      visible: true,
      layers: [
        {}, // citymap-mapped-streets-line
        { tooltipable: false }, // citymap-streets-tooltip-line
        {}, // citymap-street-treatments-line
        {}, // citymap-underpass-tunnel-line
        {}, // citymap-street-not-mapped-line
        { tooltipable: false }, // borough-boundaries
        {}, // citymap-underpass-tunnel-line
        {
          style: {
            paint: {
              'line-color': 'rgba(0,0,0,0)',
            },
          },
          tooltipable: false,
        }, // railway-lines
        {
          style: {
            paint: {
              'line-color': 'rgba(0,0,0,0)',
            },
          },
        }, // railway-cross-lines
      ],
    },
    { id: 'street-direction-arrows', visible: true },
    { id: 'commercial-overlay-patterns', visible: true },
  ],
};

export default class MapFormComponent extends Component {
  constructor(...args) {
    super(...args);

    const query = this.get('customLayerGroupQuery') || defaultLayerGroups;
    const store = this.get('store');
    store.query('layer-group', query).then((layerGroups) => {
      const { meta } = layerGroups;

      this.set('mapConfiguration', {
        layerGroups,
        meta,
      });
    });
  }

  @service
  store;

  @service
  router;

  @service
  notificationMessages

  mapConfiguration = null

  mapInstance = null

  boundsPolygon = null

  @argument
  customLayerGroupQuery = null;

  @argument
  model = null;

  @argument
  developmentSiteLayer = projectGeomLayers.developmentSiteLayer

  @argument
  projectAreaLayer = projectGeomLayers.projectAreaLayer

  @argument
  rezoningAreaIcon = projectGeomLayers.rezoningAreaIcon

  @argument
  projectBufferLayer = projectGeomLayers.projectBufferLayer

  @computed('mapBearing', 'mapPitch')
  get northArrowTransforms() {
    const bearing = this.get('model.mapBearing');
    const pitch = this.get('mapPitch');

    return {
      arrow: `transform: rotateX(${pitch}deg) rotate(${360 - bearing}deg)`,
      n: `transform: rotate(${360 - bearing}deg)`,
      nSpan: `transform: rotate(${(360 - bearing) * -1}deg)`,
    };
  }

  @action
  handleMapLoaded(map) {
    this.set('mapInstance', map);
    this.fitBoundsToBuffer();
    this.updateBounds();
    this.toggleMapInteractions();

    const scaleControl = new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'imperial' });
    map.addControl(scaleControl, 'bottom-left');

    const basemapLayersToHide = [
      'highway_path',
      'highway_minor',
      'highway_major_casing',
      'highway_major_inner',
      'highway_major_subtle',
      'highway_motorway_casing',
      'highway_motorway_inner',
      'highway_motorway_subtle',
      'highway_motorway_bridge_casing',
      'highway_motorway_bridge_inner',
      // 'highway_name_other',
      // 'highway_name_motorway',
      'tunnel_motorway_casing',
      'tunnel_motorway_inner',
      'railway_transit',
      'railway_transit_dashline',
      'railway_service',
      'railway_service_dashline',
      'railway',
      'railway_dashline',
    ];
    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
  }

  @action
  updateBounds() {
    const map = this.get('mapInstance');
    const canvas = map.getCanvas();
    let { width, height } = canvas;

    // workaround for retina displays
    if (window.devicePixelRatio > 1) {
      width *= 0.5;
      height *= 0.5;
    }

    const cUL = map.unproject([0, 0]).toArray();
    const cUR = map.unproject([width, 0]).toArray();
    const cLR = map.unproject([width, height]).toArray();
    const cLL = map.unproject([0, height]).toArray();

    this.set('boundsPolygon', {
      type: 'Polygon',
      coordinates: [[cUL, cUR, cLR, cLL, cUL]],
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326',
        },
      },
    });
    this.set('model.boundsPolygon', {
      type: 'Polygon',
      coordinates: [[cUL, cUR, cLR, cLL, cUL]],
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326',
        },
      },
    });

    this.set('mapBearing', map.getBearing());
    this.set('model.mapBearing', map.getBearing());
    this.set('mapPitch', map.getPitch());
  }

  @action
  reorientPaper(orientation) {
    this.set('model.paperOrientation', orientation);
    next(() => {
      // not supported in IE 11
      window.addEventListener('resize', () => {
        this.fitBoundsToBuffer();
        this.updateBounds();
      });
      // not supported in IE 11
      window.dispatchEvent(new Event('resize'));
    });
  }

  @action
  scalePaper(size) {
    this.set('model.paperSize', size);
    next(() => {
      // not supported in IE 11
      window.addEventListener('resize', () => {
        this.fitBoundsToBuffer();
        this.updateBounds();
      });
      // not supported in IE 11
      window.dispatchEvent(new Event('resize'));
    });
  }

  @action
  fitBoundsToBuffer() {
    const buffer = this.get('model.projectGeometryBuffer');
    const map = this.get('mapInstance');
    const bearing = this.get('model.mapBearing');

    map.fitBounds(turfBbox(buffer), {
      padding: 50,
      duration: 0,
    });

    map.setBearing(bearing);
    this.updateBounds();
  }

  @action
  toggleMapInteractions () {
    const map = this.get('mapInstance');
    const preventMapInteractions = this.get('preventMapInteractions');

    if (preventMapInteractions === true) {
      this.set('preventMapInteractions', false);
      // enable all interactions
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.dragRotate.enable();
      map.dragPan.enable();
      map.keyboard.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
    } else {
      this.set('preventMapInteractions', true);
      // disable all interactions
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }
  }

  @action
  async saveProject() {
    const model = this.get('model');
    await model.save();
    this.get('router').transitionTo('projects.edit.map.edit', model);
    this.get('notificationMessages').success('Map saved to project!');
  }
}
