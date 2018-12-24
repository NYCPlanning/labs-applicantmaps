import Component from '@ember/component';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { action, computed, observes } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { FeatureCollection, EmptyFeatureCollection } from '../../../models/project';
import isEmpty from '../../../utils/is-empty';

// modify existing draw modes direct_select to disable drag on features
MapboxDraw.modes.direct_select.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

export const DefaultDraw = MapboxDraw.bind(null, {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});

// setup events to update draw state
// bind events to the state callback
// I'm not sure which events we need or not
const callBackStateEvents = [
  'create',
  'update',
  'delete',
  'modechange',
  'selectionchange',
];

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    const {
      draw = new MapboxDraw(),
    } = this.get('map');

    // set draw instance so it's available to the class
    this.set('map.draw', draw);

    this.callbacks = {
      drawState: () => this.drawStateCallback(),
      drawMode: () => this.drawModeCallback(),
      selectedFeature: () => this.selectedFeatureCallback(),
      skipToDirectSelect: () => this.skipToDirectSelectCallback(),
    };

    const { mapInstance } = this.get('map');
    const geometricProperty = this.get('geometricProperty');

    mapInstance.addControl(draw, 'top-left');

    // if geometry exists for this mode, add it to the drawing canvas
    if (!isEmpty(geometricProperty)) {
      draw.add(geometricProperty);
    }

    callBackStateEvents.forEach((event) => {
      mapInstance.on(`draw.${event}`, this.callbacks.drawState);
    });
    mapInstance.on('draw.modechange', this.callbacks.drawMode);
    mapInstance.on('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.on('draw.selectionchange', this.callbacks.skipToDirectSelect);

    this.addGeometricPropertyCallback();
  }

  drawStateCallback() {
    const drawnFeatures = this.get('drawnFeatures');

    this.set('geometricProperty', drawnFeatures);
  }

  // update which is the selected feature
  selectedFeatureCallback() {
    const { draw } = this.get('map');
    const { features: [firstSelectedFeature] } = draw.getSelected();

    if (firstSelectedFeature) {
      this.set('selectedFeature', { type: 'FeatureCollection', features: [firstSelectedFeature] });
    } else {
      this.set('selectedFeature', EmptyFeatureCollection);
    }
  }

  // skip simple_select mode, jump straight to direct_select
  // mode so users can immediately select vertices
  // this helps avoid an additional click when something is selected
  skipToDirectSelectCallback() {
    const { draw } = this.get('map');
    const mode = draw.getMode();
    const [selected] = draw.getSelectedIds();

    if (selected && mode === 'simple_select') {
      draw.changeMode('direct_select', { featureId: selected });
      this.drawModeCallback();
    }
  }

  drawModeCallback() {
    const { draw } = this.get('map');
    this.set('drawMode', draw.getMode());
  }

  // adds geometric property from upstream model into mapbox-gl-draw
  @observes('geometricProperty')
  addGeometricPropertyCallback() {
    const latestProperty = this.get('geometricProperty');
    const { draw } = this.get('map');

    if (!isEmpty(latestProperty)) {
      draw.add(latestProperty);
    }
  }

  // Get drawn features, if they're valid
  // We need to remove weird null coordinates.
  // See https://github.com/mapbox/mapbox-gl-draw/issues/774
  @computed('geometricProperty')
  get drawnFeatures() {
    const { draw } = this.get('map');
    const features = draw.getAll().features
      .filter(({ geometry: { coordinates: [[firstCoord]] } }) => firstCoord !== null);

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  @argument
  map;

  @type(FeatureCollection)
  @argument
  geometricProperty;

  @type(FeatureCollection)
  selectedFeature = EmptyFeatureCollection;

  drawMode = null;

  @action
  handleTrashButtonClick() {
    const { draw } = this.get('map');
    const selectedFeature = draw.getSelectedIds();
    const { features: [feature] } = draw.getSelectedPoints();

    if (feature) {
      draw.trash();
    } else {
      draw.delete(selectedFeature);
    }

    this.drawStateCallback();
  }

  @action
  handleDrawButtonClick() {
    const { draw } = this.get('map');

    draw.changeMode('draw_polygon');
    this.drawModeCallback();
  }

  @action
  updateSelectedFeature(label) {
    const { draw } = this.get('map');
    const { features: [firstFeature] } = this.get('selectedFeature');

    draw.setFeatureProperty(firstFeature.id, 'label', label);

    // this triggers an update that renders the new label as mutated above to show up in the selected feature
    // see https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md#events
    this.drawStateCallback();
  }

  willDestroyElement(...args) {
    const { draw } = this.get('map');
    const { mapInstance } = this.get('map');

    callBackStateEvents.forEach((event) => {
      mapInstance.off(`draw.${event}`, this.callbacks.drawState);
    });
    mapInstance.off('draw.modechange', this.callbacks.drawMode);
    mapInstance.off('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.off('draw.selectionchange', this.callbacks.skipToDirectSelect);
    mapInstance.removeControl(draw);

    super.willDestroyElement(...args);
  }
}
