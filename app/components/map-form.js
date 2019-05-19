import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import turfBbox from '@turf/bbox';
import mapboxgl from 'mapbox-gl';
import { sanitizeStyle } from 'labs-applicant-maps/helpers/sanitize-style';
import { computed, action } from '@ember/object';
// TODO import geom layers from the various modes that export them,
// this util should be deprecated
import projectGeomLayers from '../utils/project-geom-layers';
import config from '../config/environment';

const { host } = config;

const defaultLayerGroups = {
  'layer-groups': [
    { id: 'sidewalks', visible: true },
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
    { id: 'special-purpose-districts', visible: false },
    {
      id: 'citymap',
      visible: true,
      layers: [
        {
          style: {
            paint: {
              'line-color': 'rgba(0,0,0,0.9)',
              'line-width': 2,
            },
          },
        }, // citymap-mapped-streets-line
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
            paint: {
              'text-color': 'rgba(33, 35, 38, 1)',
              'text-opacity': 1,
            },
          },
        },
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
    { id: 'street-direction-arrows', visible: true },
    // { id: 'commercial-overlay-patterns', visible: true },
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

export default class MapFormComponent extends Component {
  init(...args) {
    super.init(...args);

    const query = this.get('customLayerGroupQuery') || defaultLayerGroups;
    const store = this.get('store');

    store.query('layer-group', query).then((layerGroups) => {
      const { meta } = layerGroups;

      const sources = store.peekAll('source').toArray().uniqBy('meta.description');

      this.set('mapConfiguration', {
        layerGroups,
        meta,
        sources,
      });
    });

    // get canonical geometries for missing zoning layers, which should be displayed regardless of if the user updated them
    if (this.get('model.project.underlyingZoningModel.proposedGeometryIsEmptyDefault')) {
      this.get('model.project.underlyingZoningModel').setCanonical();
    }
    if (this.get('model.project.commercialOverlaysModel.proposedGeometryIsEmptyDefault')) {
      this.get('model.project.commercialOverlaysModel').setCanonical();
    }
    if (this.get('model.project.specialPurposeDistrictsModel.proposedGeometryIsEmptyDefault')) {
      this.get('model.project.specialPurposeDistrictsModel').setCanonical();
    }
  }

  @service
  store;

  @service
  notificationMessages;

  projectURL = window.location.href;

  mapConfiguration = null

  mapInstance = null

  boundsPolygon = null

  // // @argument
  customLayerGroupQuery = null;

  // // @argument
  model = null;

  projectGeomLayers = projectGeomLayers;

  @computed()
  get timestamp() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    let hr = d.getHours();
    let min = d.getMinutes();
    if (min < 10) { min = `0${min}`; }
    let ampm = 'am';
    if (hr > 12) {
      hr -= 12;
      ampm = 'pm';
    }
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${month} ${date}, ${year}, ${hr}:${min}${ampm}`;
  }

  @computed('model.mapBearing', 'mapPitch')
  get northArrowTransforms() {
    const bearing = this.get('model.mapBearing');
    const pitch = this.get('mapPitch');

    return sanitizeStyle([{
      arrow: `transform: rotateX(${pitch}deg) rotate(${360 - bearing}deg)`,
      n: `transform: rotate(${360 - bearing}deg)`,
      nSpan: `transform: rotate(${(360 - bearing) * -1}deg)`,
    }]);
  }

  @computed
  get downloadURL() {
    const id = this.get('model.project.id');
    return `${host}/export-pdf/${encodeURIComponent(id)}`;
  }

  @action
  handleMapLoaded(map) {
    /*
     * Set up component to emit 'mapLoaded' event on map render event.
     * Server listens for 'mapLoaded' in headless chrome browser; ensures
     * map is fully rendered before generating PDF
     */
    map.on('render', function() {
      if (map.loaded()) {
        document.dispatchEvent(new Event('mapLoaded', { bubbles: true }));
      }
    });

    this.set('mapInstance', map);
    this.fitBoundsToSelectedBuffer();
    this.toggleMapInteractions();

    const scaleControl = new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'imperial' });
    map.addControl(scaleControl, 'bottom-left');

    // for editing the OpenStreetMap basemap style (look at maputnik, mapbox GL JS API docs, or style.json in the layers-api for reference)
    const basemapLayersToHide = [
      'background',
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
      'highway_name_other',
      'highway_name_motorway',
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

    // editing building layer in the basemap to only show shape outlines and filtering for only ground floor structures
    map.setPaintProperty('building', 'fill-color', 'rgba(234, 234, 229, 0)');
    map.setPaintProperty('building', 'fill-outline-color', 'rgba(0, 0, 0, 1)');
    map.setFilter('building', ['==', 'render_min_height', 0]);
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

    this.set('model.mapBearing', map.getBearing());
    this.set('model.mapCenter', map.getCenter());
    this.set('model.mapZoom', map.getZoom());
  }

  @action
  fitBoundsToSelectedBuffer() {
    const map = this.get('mapInstance');
    const buffer = this.get('model.projectGeometryBuffer');

    next(() => {
      map.resize();
    });

    next(() => {
      map.fitBounds(turfBbox(buffer), {
        padding: 50,
        duration: 0,
      });
    });

    next(() => {
      this.updateBounds();
    });
  }

  @action
  toggleMapInteractions () {
    const map = this.get('mapInstance');
    const preventMapInteractions = this.get('preventMapInteractions');
    const targetInteractions = [
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'dragPan',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate',
    ];

    if (preventMapInteractions === true) {
      this.set('preventMapInteractions', false);
      targetInteractions
        .forEach(interaction => map[interaction].enable());
    } else {
      this.set('preventMapInteractions', true);
      targetInteractions
        .forEach(interaction => map[interaction].disable());
    }
  }

  @action
  setBufferSize(bufferSize) {
    this.set('model.bufferSize', bufferSize);
    this.fitBoundsToSelectedBuffer();
  }

  @action
  setPaperOrientation(orientation) {
    this.set('model.paperOrientation', orientation);
    this.fitBoundsToSelectedBuffer();
  }

  @action
  setPaperSize(paperSize) {
    this.set('model.paperSize', paperSize);
    this.fitBoundsToSelectedBuffer();
  }

  @action
  async saveProject() {
    const model = this.get('model');
    await model.save();
    this.get('notificationMessages').success('Map saved to project!');
  }
}
