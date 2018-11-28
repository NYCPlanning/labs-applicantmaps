import Component from '@ember/component';
import MapboxDraw from 'mapbox-gl-draw';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { FeatureCollection } from '../../../models/project';
import isEmpty from '../../../utils/is-empty';

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});

// modify existing draw modes simple_select and draw_select to disable dragging shape
// const SimpleMode = MapboxDraw.modes.simple_select;

// const DirectMode = MapboxDraw.modes.direct_select;

MapboxDraw.modes.simple_select.startOnActiveFeature = function() {
  // Enable map.dragPan immediately, overrides ability to drag shape
  this.map.dragPan.enable();
};

MapboxDraw.modes.direct_select.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    const { mapInstance } = this.get('map');

    const geometricProperty = this.get('geometricProperty');

    mapInstance.addControl(draw, 'top-left');

    // set up initial drawing mode
    draw.changeMode('draw_polygon');

    // if geometry exists for this mode, add it to the drawing canvas
    if (!isEmpty(geometricProperty)) {
      draw.add(geometricProperty);
    }

    draw.changeMode('simple_select');

    draw.changeMode('direct_select', { featureId: 'development-site-layer' });

    const drawStateCallback = () => {
      if (!this.get('isDestroyed')) this.set('geometricProperty', draw.getAll());
    };

    this.addObserver('geometricProperty', () => {
      if (!isEmpty(geometricProperty)) {
        draw.add(this.get('geometricProperty'));
      } else {
        draw.deleteAll();
      }
    });

    // setup events to update draw state
    // bind events to the state callback
    ['create', 'combine', 'uncombine', 'update', 'selectionchange']
      .forEach((event) => {
        mapInstance.on(`draw.${event}`, drawStateCallback);
      });
  }

  @argument
  map;

  @type(FeatureCollection)
  @argument
  geometricProperty;

  // validate the existence of properties
  @computed('geometricProperty')
  get isValid() {
    return !!this.get('geometricProperty');
  }

  willDestroyElement(...args) {
    super.willDestroyElement(...args);

    const { mapInstance } = this.get('map');

    // drawing cleanup
    draw.trash();
    draw.deleteAll();
    mapInstance.off('draw.selectionchange');
    mapInstance.removeControl(draw);
  }
}
