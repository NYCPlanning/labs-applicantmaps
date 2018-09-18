import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from 'mapbox-gl-draw';
import { service } from '@ember-decorators/service';
import normalizeCartoVectors from 'cartobox-promises-utility/utils/normalize-carto-vectors';


const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  // styles: drawStyles, TODO modify default draw styles
});

export default class NewProjectController extends Controller {
  constructor() {
    super(...arguments)
    this.set('selectedLots', {
      type: "FeatureCollection",
      features: [],
    });
  }

  isDrawing = false;
  drawMode = null;
  lotSelectionMode = false;

  @computed('selectedLots.features.[]')
  get selectedLotsSource() {
    console.log('evaluating selectedLotsSource')
    const selectedLots = this.get('selectedLots');
    return {
      type: 'geojson',
      data: selectedLots,
    }
  }

  selectedLotsLayer = {
    type: 'fill',
    paint: {
      'fill-color': 'rgba(217, 216, 1, 1)',
      'fill-outline-color': 'rgba(255, 255, 255, 1)',
    },
  }

  @service notificationMessages;

  @computed('model.projectArea')
  get projectAreaSource() {
    const data = this.get('model.projectArea');
    return {
      type: 'geojson',
      data,
    }
  }

  taxLotsLinesLayer = {
    "id": "pluto-line",
    "type": "line",
    "source": "pluto",
    "minzoom": 15,
    "source-layer": "pluto",
    "paint": {
      "line-width": 0.5,
      "line-color": "rgba(130, 130, 130, 1)",
      "line-opacity": {
        "stops": [
          [
            15,
            0
          ],
          [
            16,
            1
          ]
        ]
      }
    }
  }

  taxLotsLabelsLayer = {
        "id": "pluto-labels",
        "type": "symbol",
        "source": "pluto",
        "source-layer": "pluto",
        "minzoom": 15,
        "layout": {
          "text-field": "{lot}",
          "text-font": [
            "Open Sans Regular",
            "Arial Unicode MS Regular"
          ],
          "text-size": 11
        },
        "paint": {
          "text-opacity": {
            "stops": [
              [
                16.5,
                0
              ],
              [
                17.5,
                1
              ]
            ]
          },
          "icon-color": "rgba(193, 193, 193, 1)",
          "text-color": "rgba(154, 154, 154, 1)",
          "text-halo-color": "rgba(152, 152, 152, 0)"
        }
      }

  sources = normalizeCartoVectors([{
    "id": "pluto",
    "type": "cartovector",
    "minzoom": 10,
    "source-layers": [
      {
        "id": "pluto",
        "sql": "SELECT the_geom_webmercator, landuse, numfloors FROM mappluto_v1711"
      },
      {
        "id": "block-centroids",
        "sql": "SELECT the_geom_webmercator, block FROM mappluto_block_centroids"
      }
    ]
  }])

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;
    //
    // // setup controls
    // const navigationControl = new mapboxgl.NavigationControl();
    // const geoLocateControl = new mapboxgl.GeolocateControl({
    //   positionOptions: {
    //     enableHighAccuracy: true,
    //   },
    //   trackUserLocation: true,
    // });
    //
    // map.addControl(navigationControl, 'top-left');
    // map.addControl(geoLocateControl, 'top-left');
  }

  @action
  handleDrawButtonClick() {
    const isDrawing = this.get('isDrawing');
    const map = this.get('mapInstance');
    if (isDrawing) {
     draw.trash();
     this.set('isDrawing', false);
     this.set('drawMode', null);
    } else {
     map.addControl(draw, 'top-right');

     draw.changeMode('draw_polygon');

     this.set('isDrawing', true);
    }
  }

  @action
  handleLayerClick(feature) {
    const { id: layerId } = feature.layer;

    if (layerId == 'pluto-fill') {
      const { type, geometry, properties } = feature;
      const selectedLots = this.get('selectedLots');

      // if the lot is not in the selection, push it, if it is, remove it
      const inSelection = selectedLots.features.find(lot => lot.properties.bbl === properties.bbl);

      console.log('In Selection', inSelection)
      if (inSelection === undefined) {
        const mutatedLots = selectedLots.features.copy();
        mutatedLots.push({
          type,
          geometry,
          properties,
        });

        this.set('selectedLots.features', mutatedLots);
      } else {
        this.set('selectedLots.features', selectedLots.features.filter(lot => lot.properties.bbl !== properties.bbl));
      }
    }
  }

  @action
  handleLotSelectionButtonClick() {
    const { lotSelectionMode } = this;

    if (!lotSelectionMode) {
      console.log('Time to select lots!')
    }
  }

  @action
  setProjectArea(e) {
    // delete the drawn geometry
    draw.deleteAll();

    const { geometry } = e.features[0];

    this.set('model.projectArea', geometry)
  }

  @action
  async save(model) {
    const project = await model.save();

    this.get('notificationMessages').success('Project saved!');

    this.transitionToRoute('projects.edit', project);
  }
}
