import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
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
  constructor(...args) {
    super(...args);
    this.set('selectedLots', {
      type: 'FeatureCollection',
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
    };
  }

  developmentSiteLayer = {
    type: 'line',
    paint: {
      'line-color': 'green',
      'line-width': 4,
    },
  }

  projectAreaLayer = {
    type: 'line',
    paint: {
      'line-color': 'orange',
      'line-width': 4,
    },
  }

  selectedLotsLayer = {
    type: 'fill',
    paint: {
      'fill-color': 'rgba(217, 216, 1, 1)',
      'fill-outline-color': 'rgba(255, 255, 255, 1)',
    },
  }

  @service notificationMessages;

  @argument
  projectGeometryMode = null;

  @argument
  isAddingDevelopmentSite = false;

  @argument
  isAddingProjectArea = false;

  @argument
  isAddingRezoningArea = false;

  @argument
  isSelectingLots = false;


  @computed('model.developmentSite')
  get developmentSiteSource() {
    const data = this.get('model.developmentSite');
    return {
      type: 'geojson',
      data,
    };
  }

  @computed('model.projectArea')
  get projectAreaSource() {
    const data = this.get('model.projectArea');
    return {
      type: 'geojson',
      data,
    };
  }

  @action toggleGeometryEditing(type) {
    this.set('projectGeometryMode', type);

    const projectGeometryMode = this.get('projectGeometryMode');

    const map = this.get('mapInstance');
    if (projectGeometryMode) {
      map.addControl(draw, 'top-right');
      draw.changeMode('draw_polygon');
      // this.set('isDrawing', true);
    } else {
      draw.trash();
      map.removeControl(draw);
      this.set('isDrawing', false);
      // this.set('drawMode', null);
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
    if (layerId === 'pluto-fill' && this.get('lotSelectionMode')) {
      const { type, geometry, properties } = feature;
      const selectedLots = this.get('selectedLots');

      // if the lot is not in the selection, push it, if it is, remove it
      const inSelection = selectedLots.features.find(lot => lot.properties.bbl === properties.bbl);

      if (inSelection === undefined) {
        this.get('selectedLots.features').pushObject({
          type,
          geometry,
          properties,
        });
      } else {
        this.set('selectedLots.features', selectedLots.features.filter(lot => lot.properties.bbl !== properties.bbl));
      }
    }
  }

  @action
  startLotSelection() {
    this.set('lotSelectionMode', true);
    draw.trash();
    draw.changeMode('simple_select');
  }

  @action
  finishLotSelection() {
    // should be run when user is done selecting lots
    this.set('lotSelectionMode', false);

    const selectedLots = this.get('selectedLots');
    const bufferkm = 0.00008;

    let union = turfBuffer(selectedLots.features[0].geometry, bufferkm);

    if (selectedLots.features.length > 1) {
      for (let i = 1; i < selectedLots.features.length; i += 1) {
        const bufferedGeometry = turfBuffer(selectedLots.features[i].geometry, bufferkm);

        union = turfUnion.default(union, bufferedGeometry);
      }
    }


    // set the drawn geom as an editable mapbox-gl-draw geom
    draw.set({
      type: 'FeatureCollection',
      features: [union],
    });
    // clear selected features
    this.set('selectedLots.features', []);
  }

  @action
  setProjectGeometry() {
    const FeatureCollection = draw.getAll();

    // delete the drawn geometry
    draw.deleteAll();

    const { geometry } = FeatureCollection.features[0];
    const projectGeometryMode = this.get('projectGeometryMode');

    // set geometry depending on mode
    const model = this.get('model');
    model.set(projectGeometryMode, geometry);
    this.set('model', model);

    this.toggleGeometryEditing(null);
    console.log(projectGeometryMode)
    console.log(this.get('model').toJSON());
  }

  @action
  async save(model) {
    const project = await model.save();

    this.get('notificationMessages').success('Project saved!');

    this.transitionToRoute('projects.edit', project);
  }
}
