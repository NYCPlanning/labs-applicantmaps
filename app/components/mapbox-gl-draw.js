import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DefaultMapboxDrawStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import { next } from '@ember/runloop';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { setProperties } from '@ember/object';
import AnnotationsMode from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/mode';
import AnnotationsStyles from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/styles';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

const DirectSelectUndraggable = MapboxDraw.modes.direct_select;

DirectSelectUndraggable.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

// extend styles
const styles = [...AnnotationsStyles, ...DefaultMapboxDrawStyles].uniqBy('id');

export const DefaultDraw = MapboxDraw.bind(null, {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  modes: Object.assign({
    direct_select_undraggable: DirectSelectUndraggable,
    'draw_annotations:linear': AnnotationsMode,
    'draw_annotations:curved': AnnotationsMode,
  }, MapboxDraw.modes),
  styles,
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
        getMode: () => this.drawInstance.getMode(),
      },
    });

    // callback event map
    this.callbacks = {
      drawState: () => this.drawStateCallback(),
      drawMode: () => this.drawModeCallback(),
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

  // downstream add into mapbox-gl-draw
  @action
  add(featureCollection) {
    const drawInstance = this.get('drawInstance');

    // if geometry exists for this mode, add it to the drawing canvas
    if (!isEmpty(featureCollection)
      && !this.get('isDestroying')) {
      drawInstance.set(featureCollection);
    }
  }

  @action
  handleDrawButtonClick() {
    this.router.transitionTo({
      queryParams: {
        mode: 'draw',
      },
    });

    next(() => {
      this.drawInstance.changeMode('draw_polygon');
    });
  }

  @action
  handleAnnotation(mode) {
    next(() => {
      this.drawInstance.changeMode(mode);
    });
  }

  shouldReset(geometricProperty) {
    if (!isEmpty(geometricProperty)) {
      this.add(geometricProperty);
    } else {
      this.deleteAll();
    }
  }

  willDestroyElement(...args) {
    const { mapInstance, draw: { drawInstance } } = this.get('map');

    mapInstance.removeControl(drawInstance);
    mapInstance.on('draw.selectionchange', this.callbacks.selectedFeature);

    super.willDestroyElement(...args);
  }
}
