import Component from '@ember/component';
import MapboxDraw from 'mapbox-gl-draw';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { FeatureCollection, EmptyFeatureCollection } from '../../../models/project';
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
      if (!this.get('isDestroyed')) {
        this.setProperties({
          geometricProperty: draw.getAll(),
          drawMode: draw.getMode(),
        });

        const { features: [firstSelectedFeature] } = draw.getSelected();
        if (firstSelectedFeature) {
          this.set('selectedFeature', { type: 'FeatureCollection', features: [firstSelectedFeature] });
        } else {
          this.set('selectedFeature', EmptyFeatureCollection);
        }
      }
    };

    this.addObserver('geometricProperty', () => {
      const latestProperty = this.get('geometricProperty');
      if (!isEmpty(latestProperty)) {
        draw.add(latestProperty);
      } else {
        draw.deleteAll();
      }
    });

    // setup events to update draw state
    // bind events to the state callback
    [
      'create',
      'combine',
      'uncombine',
      'update',
      'selectionchange',
      'modechange',
      'delete',
    ]
      .forEach((event) => {
        mapInstance.on(`draw.${event}`, drawStateCallback);
      });
  }

  @argument
  map;

  @type(FeatureCollection)
  @argument
  geometricProperty;

  @type(FeatureCollection)
  selectedFeature = EmptyFeatureCollection;

  drawMode = null;

  // validate the existence of properties
  @computed('geometricProperty')
  get isValid() {
    return !!this.get('geometricProperty');
  }

  @action
  handleTrashButtonClick() {
    draw.trash();
  }

  @action
  handleDrawButtonClick() {
    draw.changeMode('simple_select');
    draw.changeMode('draw_polygon');
    this.set('drawMode', draw.getMode());
  }

  @action
  updateSelectedFeature(label) {
    const { features: [firstFeature] } = this.get('selectedFeature');

    draw.setFeatureProperty(firstFeature.id, 'label', label);
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
