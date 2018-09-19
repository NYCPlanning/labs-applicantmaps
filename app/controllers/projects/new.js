import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from 'mapbox-gl-draw';
import { service } from '@ember-decorators/service';
import turfUnion from 'npm:@turf/union';
import turfBuffer from 'npm:@turf/buffer';

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

  @action
  handleSearchSelect(result) {
    const map = this.get('mapInstance');

    // handle address search results
    if (result.type === 'lot') {
      const center = result.geometry.coordinates;
      this.set('searchedAddressSource', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: result.geometry,
        },
      });

      if (map) {
        map.flyTo({
          center,
          zoom: 15,
        });
      }
    }
  }

  @action
  handleSearchClear() {
    this.set('searchedAddressSource', null);
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();

    map.addControl(navigationControl, 'top-left');
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

    // if lot was clicked when in lot selection mode, handle the clicl
    if (layerId == 'pluto-fill' && this.get('lotSelectionMode')) {
      const { type, geometry, properties } = feature;
      const selectedLots = this.get('selectedLots');

      // if the lot is not in the selection, push it, if it is, remove it
      const inSelection = selectedLots.features.find(lot => lot.properties.bbl === properties.bbl);

      if (inSelection === undefined) {
        this.get('selectedLots.features').pushObject({
          type,
          geometry,
          properties,
        })
      } else {
        this.set('selectedLots.features', selectedLots.features.filter(lot => lot.properties.bbl !== properties.bbl));
      }
    }
  }

  @action
  handleLotSelectionButtonClick() {
    const lotSelectionMode = this.get('lotSelectionMode');
    this.set('lotSelectionMode', !lotSelectionMode)

    // if finished with lot selection mode, process the selected lots
    if (lotSelectionMode) {
      const selectedLots = this.get('selectedLots');
      const bufferkm = .00005

      let union = turfBuffer(selectedLots.features[0].geometry, bufferkm)

      if (selectedLots.features.length > 1) {
        for(let i=1; i< selectedLots.features.length; i += 1) {

          const bufferedGeometry = turfBuffer(selectedLots.features[i].geometry, bufferkm)

          union = turfUnion.default(union, bufferedGeometry)
        }
      }

      // set the union as the projectArea
      this.set('model.projectArea', union)
      // clear selected features
      this.set('selectedLots.features', [])
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
