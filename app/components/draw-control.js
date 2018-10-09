import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import MapboxDraw from 'mapbox-gl-draw';
import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import turfSimplify from '@turf/simplify';
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
  tooltip

  @argument
  modeDisplayName

  @argument
  hasGeom

  @argument
  required = false;

  @argument
  geometryMode

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
  resetAction = null

  @argument
  doneAction = null

  selectedZoningFeature = undefined

  deleteModalIsOpen = false

  @argument
  disabled = false

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

  // if geometryMode is one of the three proposed zoning overlays, this is true
  @computed('mode')
  get isProposedZoningMode() {
    const geometryMode = this.get('mode');

    if (geometryMode === 'proposedZoning'
      || geometryMode === 'proposedCommercialOverlays'
      || geometryMode === 'proposedSpecialPurposeDistricts') {
      return true;
    }
    return false;
  }

  @action
  toggleGeometryEditing(mode) {
    this.set('geometryMode', mode);

    const geometryMode = this.get('geometryMode');

    const map = this.get('mapInstance');
    if (geometryMode) {
      map.addControl(draw, 'top-left');
      draw.changeMode('draw_polygon');
      const model = this.get('model');

      // if geometry exists for this mode, add it to the drawing canvas
      if (model.get(geometryMode)) {
        draw.add(model.get(geometryMode));
        draw.changeMode('simple_select');
      }

      map.on('draw.selectionchange', ({ features }) => {
        if (this.get('isProposedZoningMode') && (features.length === 1) && (!this.get('isDestroyed'))) {
          this.set('selectedZoningFeature', features[0]);
        } else {
          this.set('selectedZoningFeature', null);
        }
      });
    } else {
      // breakdown all the drawing mode stuff
      draw.trash();
      map.off('draw.selectionchange');
      map.removeControl(draw);
      this.set('selectedZoningFeature', null);
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

        union = turfUnion(union, bufferedGeometry);
      }
    }

    union = turfSimplify(union, { tolerance: 0.000001 });

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

    const geometryMode = this.get('geometryMode');
    const isProposedZoningMode = this.get('isProposedZoningMode');
    const model = this.get('model');

    // set geometry depending on mode
    if (isProposedZoningMode) {
      model.set(geometryMode, FeatureCollection);
    } else {
      const { geometry } = FeatureCollection.features[0];
      model.set(geometryMode, geometry);
    }

    const doneAction = this.get('doneAction');
    if (doneAction) {
      this.handleDone();
    }

    // breakdown the draw tools
    this.toggleGeometryEditing(null);
  }

  @action
  updateSelectedZoningFeature(label) {
    const id = this.get('selectedZoningFeature.id');
    draw.setFeatureProperty(id, 'label', label);
  }

  @action
  deleteGeom() {
    const geometryMode = this.get('mode');
    const model = this.get('model');

    model.set(geometryMode, null);
    this.set('deleteModalIsOpen', false);
  }

  @action
  resetOverlay() {
    this.set('deleteModalIsOpen', false);
    this.resetAction();
  }

  @action
  handleDone() {
    this.doneAction();
  }
}
