import length from '@turf/length';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

function createVertex(parentId, coordinates, path, selected) {
  return {
    type: 'Feature',
    properties: {
      meta: 'vertex',
      parent: parentId,
      coord_path: path,
      active: (selected) ? 'true' : 'false',
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  };
}

const doubleClickZoom = {
  enable: (ctx) => {
    setTimeout(() => {
      // First check we've got a map and some context.
      if (!ctx.map || !ctx.map.doubleClickZoom || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;
      // Now check initial state wasn't false (we leave it disabled if so)
      if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom')) return;
      ctx.map.doubleClickZoom.enable();
    }, 0);
  },
};

const AnnotationMode = { ...MapboxDraw.modes.draw_line_string };

AnnotationMode.clickAnywhere = function(state, e) {
  // this ends the drawing after the user creates a second point, triggering this.onStop
  if (state.currentVertexPosition === 1) {
    state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
    return this.changeMode('simple_select', { featureIds: [state.line.id] });
  }
  this.updateUIClasses({ mouse: 'add' });
  state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  if (state.direction === 'forward') {
    state.currentVertexPosition += 1; // eslint-disable-line
    state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  } else {
    state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
  }

  return null;
};

// creates the final geojson point feature with a radius property
// triggers draw.create
AnnotationMode.onStop = function(state) {
  doubleClickZoom.enable(this);

  this.activateUIButton();

  // check to see if we've deleted this feature
  if (this.getFeature(state.line.id) === undefined) return;

  // remove last added coordinate
  state.line.removeCoordinate('0');
  if (state.line.isValid()) {
    const lineGeoJson = state.line.toGeoJSON();
    // reconfigure the geojson line into a geojson point with a radius property
    const pointWithRadius = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [lineGeoJson.geometry.coordinates[0], lineGeoJson.geometry.coordinates[1]],
      },
      properties: {
        id: state.line.id,
        label: `${(length(lineGeoJson) * 3280.8).toFixed(1)} ft`,
      },
    };

    this.map.fire('draw.create', {
      features: [pointWithRadius],
    });
  } else {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode('simple_select', {}, { silent: true });
  }
};

AnnotationMode.toDisplayFeatures = function(state, geojson, display) {
  // categorize this internally as a product of this mode
  geojson.properties['meta:mode'] = this._ctx.events.currentModeName();
  state.line.properties['meta:mode'] = this._ctx.events.currentModeName();

  // calculate label, append to properties
  const label = `${(length(geojson) * 3280.84).toFixed(0)} ft`; // km to feet
  state.line.properties.label = label;
  geojson.properties.label = label;

  const isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = (isActiveLine) ? 'true' : 'false';
  if (!isActiveLine) return display(geojson);

  // Only render the line if it has at least one real coordinate
  if (geojson.geometry.coordinates.length < 2) return null;
  geojson.properties.meta = 'feature';

  // displays first vertex as a point feature
  display(createVertex(
    state.line.id,
    geojson.geometry.coordinates[state.direction === 'forward' ? geojson.geometry.coordinates.length - 2 : 1],
    `${state.direction === 'forward' ? geojson.geometry.coordinates.length - 2 : 1}`,
    false,
  ));

  // displays the line as it is drawn
  display(geojson);

  // create custom feature for the current pointer position
  const currentVertex = {
    type: 'Feature',
    properties: {
      meta: 'currentPosition',
      parent: state.line.id,
    },
    geometry: {
      type: 'Point',
      coordinates: geojson.geometry.coordinates[1],
    },
  };
  display(currentVertex);

  // display label
  return null;
};

export default AnnotationMode;
