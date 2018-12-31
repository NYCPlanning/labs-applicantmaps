import Component from '@ember/component';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { action, computed, observes } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import geojsonhint from '@mapbox/geojsonhint';
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

const drawStyles = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 5,
      'circle-color': 'rgba(139, 132, 132, 1)',
    },
  },
  // {
  //   id: 'gl-draw-polygon-stroke-inactive',
  //   type: 'line',
  //   filter: ['all',
  //     ['==', 'active', 'false'],
  //     ['==', '$type', 'Polygon'],
  //     ['!=', 'mode', 'static'],
  //   ],
  //   layout: {
  //     'line-cap': 'round',
  //     'line-join': 'round',
  //   },
  //   paint: {
  //     'line-color': '#3bb2d0',
  //     'line-width': 2,
  //   },
  // },
  // {
  //   id: 'gl-draw-polygon-stroke-active',
  //   type: 'line',
  //   filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
  //   layout: {
  //     'line-cap': 'round',
  //     'line-join': 'round',
  //   },
  //   paint: {
  //     'line-color': '#fbb03b',
  //     'line-dasharray': [0.2, 2],
  //     'line-width': 2,
  //   },
  // },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all',
      ['==', '$type', 'LineString'],
      ['==', 'active', 'true'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 8,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 5,
      'circle-color': 'rgba(139, 132, 132, 1)',
    },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'circle-radius': 3,
      'circle-color': '#3bb2d0',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
    ],
    paint: {
      'circle-radius': 10,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true']],
    paint: {
      'circle-radius': 7,
      'circle-color': 'rgba(139, 132, 132, 1)',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },
];

// setup events to update draw state
// bind events to the state callback
// I'm not sure which events we need or not
const callBackStateEvents = [
  'create',
  'update',
  'delete',
  'modechange',
  'selectionchange',
  'render',
];

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    const {
      draw = new MapboxDraw({
        styles: drawStyles,
      }),
    } = this.get('map');
    window.draw = draw;
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
      .filter((feature) => {
        const errors = geojsonhint.hint(feature).filter(d => d.level !== 'message');
        return !errors.length;
      });

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
