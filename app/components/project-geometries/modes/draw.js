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

    const drawStateCallback = () => {
      if (!this.get('isDestroyed')) this.set('geometricProperty', draw.getAll());
    };

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
