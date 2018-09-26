import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { next } from '@ember/runloop';
import turfBbox from 'npm:@turf/bbox';

const developmentSiteLayer = {
  id: 'development-site-line',
  type: 'line',
  paint: {
    'line-width': 2,
    'line-color': 'red',
  },
};

const projectAreaLayer = {
  id: 'project-area-line',
  type: 'line',
  layout: {
    visibility: 'visible',
    'line-cap': 'round',
  },
  paint: {
    'line-width': 3,
    'line-dasharray': [
      0,
      2,
    ],
  },
};

const projectBufferLayer = {
  id: 'project-buffer-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(122, 0, 72, 1)',
    'line-width': 3,
    'line-dasharray': [
      0.75,
      0.75,
    ],
  },
};

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

  boundsPolygon = null

  mapPitch = null

  mapBearing = null

  paperSize = 'tabloid'

  paperOrientation = 'landscape'

  @argument customLayerGroupQuery = null;

  @service
  store;

  @service
  router;

  @argument
  model = null;

  @service
  notificationMessages;

  mapConfiguration = null;

  developmentSiteLayer = developmentSiteLayer

  projectAreaLayer = projectAreaLayer

  projectBufferLayer = projectBufferLayer

  mapInstance = null

  mapPitch = null

  mapBearing = null

  @computed('mapBearing', 'mapPitch')
  get northArrowTransforms() {
    const bearing = this.get('mapBearing');
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
    this.handleMapRotateOrPitch();
    this.updateBounds();
    this.toggleMapInteractions();

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
  handleMapRotateOrPitch() {
    const map = this.get('mapInstance');
    this.set('mapBearing', map.getBearing());
    this.set('mapPitch', map.getPitch());
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
  }

  @action
  reorientPaper(orientation) {
    this.set('paperOrientation', orientation);
    next(() => {
      // not supported in IE 11
      window.addEventListener('resize', () => {
        this.updateBounds();
      });
      // not supported in IE 11
      window.dispatchEvent(new Event('resize'));
    });
  }

  @action
  scalePaper(size) {
    this.set('paperSize', size);
    next(() => {
      // not supported in IE 11
      window.addEventListener('resize', () => {
        this.updateBounds();
      });
      // not supported in IE 11
      window.dispatchEvent(new Event('resize'));
    });
  }

  @action
  fitBoundsToBuffer() {
    const buffer = this.get('model.project.projectGeometryBuffer');
    const map = this.get('mapInstance');

    map.setBearing(0);
    map.fitBounds(turfBbox.default(buffer), {
      padding: 50,
      duration: 0,
    });

    this.handleMapRotateOrPitch();
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

  // TODO for some reason I have to pass in the projectArea instead
  // of just calling this.get('projectAreaSource') ('this' is not available in the action)
  @action
  handleMapLoad(projectArea, map) { // eslint-disable-line
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 100,
    });
  }

  @action
  async saveProject(model) {
    const map = await model.save();

    this.get('notificationMessages').success('Map added!');
    this.get('router').transitionTo('projects.show', map.get('project'));
  }
}
