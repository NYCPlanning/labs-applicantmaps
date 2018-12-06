import Component from '@ember/component';
import MapboxDraw from 'mapbox-gl-draw';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { FeatureCollection, EmptyFeatureCollection } from '../../../models/project';
import isEmpty from '../../../utils/is-empty';

export const DefaultDraw = MapboxDraw.bind(null, {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});

// modify existing draw modes direct_select to disable drag on features
MapboxDraw.modes.direct_select.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    const {
      mapInstance,
      draw = new DefaultDraw(),
    } = this.get('map');

    // set draw instance so it's available to the class
    this.set('map.draw', draw);

    const geometricProperty = this.get('geometricProperty');

    mapInstance.addControl(draw, 'top-left');

    // if geometry exists for this mode, add it to the drawing canvas
    if (!isEmpty(geometricProperty)) {
      draw.add(geometricProperty);
    }

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

    // skip simple_select mode, jump straight to direct_select mode so users can immediately select vertices
    mapInstance.on('draw.selectionchange', () => {
      const mode = draw.getMode();
      const selected = draw.getSelectedIds()[0];

      if (selected && mode === 'simple_select') {
        draw.changeMode('direct_select', { featureId: selected });
      }
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
    const { draw } = this.get('map');
    const selectedFeature = draw.getSelectedIds();
    const selectedVertices = draw.getSelectedPoints();

    if (selectedVertices.features[0]) {
      draw.trash();
    } else {
      draw.delete(selectedFeature);
    }
  }

  @action
  handleDrawButtonClick() {
    const { draw } = this.get('map');
    draw.changeMode('simple_select');
    draw.changeMode('draw_polygon');
    this.set('drawMode', draw.getMode());
  }

  @action
  updateSelectedFeature(label) {
    const { draw } = this.get('map');
    const { features: [firstFeature] } = this.get('selectedFeature');

    draw.setFeatureProperty(firstFeature.id, 'label', label);
  }

  willDestroyElement(...args) {
    super.willDestroyElement(...args);

    const { draw } = this.get('map');
    const { mapInstance } = this.get('map');

    mapInstance.off('draw.selectionchange');
    mapInstance.removeControl(draw);
  }
}
