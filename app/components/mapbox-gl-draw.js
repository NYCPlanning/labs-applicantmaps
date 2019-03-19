import Component from '@ember/component';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DefaultMapboxDrawStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import { next } from '@ember/runloop';
import { inject as service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { setProperties } from '@ember/object';
import AnnotationsMode,
{
  CustomDirectSelect,
  CustomDirectSelectForRezoning,
  annotatable,
} from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/mode';
import AnnotationsStyles from 'labs-applicant-maps/utils/mapbox-gl-draw/annotations/styles';
import isEmpty from 'labs-applicant-maps/utils/is-empty';


// extend styles
const styles = [...AnnotationsStyles, ...DefaultMapboxDrawStyles].uniqBy('id');
const AnnotationsDrawPointMode = { ...annotatable(MapboxDraw.modes.draw_point) };

export const DefaultDraw = MapboxDraw.bind(null, {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  modes: Object.assign(MapboxDraw.modes, {
    direct_select_rezoning: CustomDirectSelectForRezoning,
    direct_select: CustomDirectSelect,
    'draw_annotations:linear': AnnotationsMode, // These are identical because they function the same
    'draw_annotations:curved': AnnotationsMode, // but only really need to be named differently
    'draw_annotations:square': AnnotationsMode,
    'draw_annotations:label': AnnotationsDrawPointMode,
    'draw_annotations:centerline': AnnotationsMode,
    // duplicate mode with distinct name  to avoid `skipToDirectSelect` trigger when we switch to simple_select for delete
    simple_select_delete: MapboxDraw.modes.simple_select,
  }),
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
  // @argument
  map;

  @computed
  get drawInstance() {
    const { draw: { drawInstance } } = this.get('map');

    return drawInstance;
  }

  @action
  deleteAll() {
    const drawInstance = this.get('drawInstance');

    // unclear why, but unpredictably `deleteAll` is not available on the mapbox-gl-draw
    // instance. Does the method not become available until something is added? Who knows.
    if (!this.get('isDestroyed') && !this.get('isDestroying') && drawInstance.deleteAll) {
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

  // TODO: clarify the purpose of this
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

    super.willDestroyElement(...args);
  }
}
