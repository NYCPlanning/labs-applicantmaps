import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { next } from '@ember/runloop';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { setProperties } from '@ember/object';

import AnnotationsMode from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/mode';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

const DirectSelectUndraggable = MapboxDraw.modes.direct_select;

DirectSelectUndraggable.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

export const DefaultDraw = MapboxDraw.bind(null, {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  modes: Object.assign({
    direct_select_undraggable: DirectSelectUndraggable,
    draw_annotations: AnnotationsMode,
  }, MapboxDraw.modes),
});

export default class MapboxGlDraw extends Component {
  constructor(...args) {
    super(...args);

    const {
      draw = new DefaultDraw(),
    } = this.get('map');

    // intercept the map contextual object, set the
    // instantiated draw instance
    // wrap methods in runloop-safe
    setProperties(this.get('map'), {
      draw: {
        drawInstance: draw,

        // these methods are wrapped to help with runloop
        deleteAll: () => next(() => this.deleteAll()),
        add: featureCollection => next(() => this.add(featureCollection)),
        shouldReset: featureCollection => this.shouldReset(featureCollection),
      },
    });

    // callback event map
    this.callbacks = {
      drawState: () => this.drawStateCallback(),
      drawMode: () => this.drawModeCallback(),
      selectedFeature: () => this.selectedFeatureCallback(),
      skipToDirectSelect: () => this.skipToDirectSelectCallback(),
    };

    // add controls
    const { mapInstance } = this.get('map');
    mapInstance.addControl(draw, 'top-left');

    // provide methods to service
    this.get('currentMode').set('componentInstance', this.get('map.draw'));
  }

  @service
  currentMode;

  @service
  router;

  // @required
  // should be the ember-mapbox-gl contextual object
  // passed from within a mapbox-gl component block
  @argument
  map;

  @computed
  get drawInstance() {
    const { draw: { drawInstance } } = this.get('map');

    return drawInstance;
  }

  @action
  deleteAll() {
    const drawInstance = this.get('drawInstance');

    if (!this.get('isDestroying')) {
      drawInstance.deleteAll();
    }
  }

  @action
  add(featureCollection) {
    const drawInstance = this.get('drawInstance');

    // if geometry exists for this mode, add it to the drawing canvas
    if (!isEmpty(featureCollection)
      && !this.get('isDestroying')) {
      drawInstance.add(featureCollection);
    }
  }

  @action
  handleDrawButtonClick() {
    this.router.transitionTo({
      queryParams: {
        mode: 'draw',
        target: 'proposedGeometry',
      },
    });

    next(() => {
      this.drawInstance.changeMode('draw_polygon');
    });
  }

  @action
  handleStraightLine() {
    this.router.transitionTo({
      queryParams: {
        mode: 'draw/annotation',
        target: 'annotations',
      },
    });

    next(() => {
      this.drawInstance.changeMode('draw_line_string');
    });
  }

  shouldReset(geometricProperty) {
    this.deleteAll();

    if (!isEmpty(geometricProperty)) {
      this.add(geometricProperty);
    }
  }

  willDestroyElement(...args) {
    const { mapInstance, draw: { drawInstance } } = this.get('map');

    mapInstance.removeControl(drawInstance);

    super.willDestroyElement(...args);
  }
}
