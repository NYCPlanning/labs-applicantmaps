import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import MapboxDraw from 'mapbox-gl-draw';
import turfUnion from 'npm:@turf/union';
import turfBuffer from 'npm:@turf/buffer';
import projectGeomLayers from '../utils/project-geom-layers';


const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  // styles: drawStyles, TODO modify default draw styles
});


export default class DrawControlController extends Component {
  @argument
  lotSelectionMode

  @argument
  mode

  @argument
  modeDisplayName

  @argument
  tooltip;

  @argument
  hasGeom

  @argument
  geometryMode

  @argument
  hideDrawInstructions = true

  @argument
  toggleGeometryEditing

  @argument
  startLotSelection

  @argument
  finishLotSelection

  @argument
  selectedLots

  @argument
  lotSelectionMode

  @argument
  setProjectGeometry

  @argument
  mapInstance

  @argument
  model

  @argument
  developmentSiteIcon = projectGeomLayers.developmentSiteIcon

  @argument
  projectAreaIcon = projectGeomLayers.projectAreaIcon

  @argument
  rezoningAreaIcon = projectGeomLayers.rezoningAreaIcon

  @computed('mode')
  get modeIcon() {
    const mode = this.get('mode');
    const rezoningAreaIcon = this.get('rezoningAreaIcon');
    const projectAreaIcon = this.get('projectAreaIcon');
    const developmentSiteIcon = this.get('developmentSiteIcon');

    if (mode === 'rezoningArea') { return rezoningAreaIcon; }
    if (mode === 'projectArea') { return projectAreaIcon; }
    return developmentSiteIcon;
  }

  @action toggleGeometryEditing(type) {
    this.set('geometryMode', type);
    this.set('hideDrawInstructions', false);

    const geometryMode = this.get('geometryMode');

    const map = this.get('mapInstance');
    if (geometryMode) {
      map.addControl(draw, 'top-left');
      draw.changeMode('draw_polygon');

      // if geometry exists for this mode, add it to the drawing canvas
      const model = this.get('model');
      if (model.get(geometryMode)) {
        draw.add(model.get(geometryMode));
        draw.changeMode('simple_select');
      }
    } else {
      draw.trash();
      map.removeControl(draw);
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
    // runs when user is done selecting lots
    // adds a small buffer to all lots to ensure the union will be contiguous
    // unions all lots together into one feature
    // TODO simplify the resulting union to get rid of curved corners with many vertices
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
    const geometryMode = this.get('geometryMode');

    // set geometry depending on mode
    const model = this.get('model');
    model.set(geometryMode, geometry);

    // breakdown the draw tools
    this.toggleGeometryEditing(null);
  }
}
