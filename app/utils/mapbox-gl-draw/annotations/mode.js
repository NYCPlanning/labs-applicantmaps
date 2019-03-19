import length from '@turf/length';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


/** *************** CUSTOM DIRECT SELECT ****************** */
export const CustomDirectSelect = { ...MapboxDraw.modes.direct_select };

/* If the geometry we just drew is a polygon,
 * then, check if the polygon is missing a label. If it is,
 * then, block switching draw/annotation modes until label is created. Else,
 * call parent onClick() from original direct_select mode to return to normal behavior.
 *
 * NOTE: use changeMode to trigger draw.selectionchange event, which triggers
 * selectedFeatureCallback in the draw map object for feature post processing.
 * Required b/c adding a top-level feature here does not persist back to draw map context
 */
CustomDirectSelect.onFeature = function() {
  // Enable map.dragPan when user clicks on feature, overrides ability to drag shape
  this.map.dragPan.enable();
};

export const CustomDirectSelectForRezoning = { ...CustomDirectSelect };
/* see https://github.com/NYCPlanning/labs-applicantmaps/issues/417 for full context about this mode */
function isPolygon(feature) {
  return feature.type === 'Polygon';
}

function polygonIsUnlabeled(feature) {
  if (feature.properties.label) {
    return false;
  }

  return true;
}

function clickedFeatureIsCurrentFeatureChildVertex(clicked, currentFeature) {
  if (!clicked.properties.active) return false;

  if (!clicked.properties.parent) return false;

  if (clicked.properties.parent !== currentFeature.id) return false;

  return true;
}

function clickedFeatureIsCurrentFeature(clicked, currentFeature) {
  if (!clicked.properties.active) return false;

  if (clicked.properties.id !== currentFeature.id) return false;

  return true;
}

CustomDirectSelectForRezoning.onClick = function(state, e) {
  const selected = this.getSelected();
  const clicked = e.featureTarget;

  // if we have selected (i.e. just finished drawing) a polygon
  if (selected.length && isPolygon(selected[0])) {
    const selectedFeature = selected[0];

    // if we're clicking on a point in the polygon  direct select that
    if (clickedFeatureIsCurrentFeatureChildVertex(clicked, selectedFeature)) {
      return this.onVertex(state, e);
    }

    // if we're clicking on the polygon itself, select the polygon
    // (necessary to re-select incase previously a point IN the polygon was the "active" feature)
    if (clickedFeatureIsCurrentFeature(clicked, selectedFeature)) {
      return this.changeMode('direct_select_rezoning', { featureId: selectedFeature.id });
    }

    // if we're clicking elsewhere on the map,
    // and polygon is unlabeled
    // signal it is missing a label,
    // change mode to trigger a re-render of the map
    // and return early to block the click action
    if (polygonIsUnlabeled(selectedFeature)) {
      selectedFeature.properties.missingLabel = true;
      return this.changeMode('direct_select_rezoning', { featureId: selectedFeature.id });
    }
  }

  // do normal direct_select on click action
  return MapboxDraw.modes.direct_select.onClick.apply(this, [state, e]);
};

/** ********************* DRAW LINE STRING FOR DISTANCE MEASUREMENTS MODE *************** */
// extend draw_line_string mode to include distance measurements with drawn lines
export function roundLength(len) {
  return Math.round(len / 5) * 5;
}

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

const MeasurementMode = { ...MapboxDraw.modes.draw_line_string };

MeasurementMode.onClick = function(state, e) {
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
MeasurementMode.onStop = function(state) {
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

export function toDisplayFeatures(state, geojson, display) {
  // calculate label, append to properties
  const label = `${roundLength(length(geojson) * 3280.84)} ft`; // km to feet
  state.line.properties.label = label;
  geojson.properties.label = label;

  const isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = (isActiveLine) ? 'true' : 'false';
  if (!isActiveLine) return display(geojson);

  if (geojson.properties.mode === 'draw_annotations:square') {
    geojson.properties.label = '';
  }

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
}

MeasurementMode.toDisplayFeatures = toDisplayFeatures;
export function annotatable(mode) {
  return {
    ...mode,
    ...{
      toDisplayFeatures(state, geojson, display) {
        // categorize this internally as a product of this mode
        geojson.properties['meta:mode'] = this._ctx.events.currentModeName();

        // the "state" param will be structured based on the geometry type
        // so we look for props to imprint the current type
        Object.keys(state).forEach((typeKey) => {
          // some of the other props in here are unrelated
          if (state[typeKey].properties) {
            state[typeKey].properties['meta:mode'] = this._ctx.events.currentModeName();
          }
        });

        return mode.toDisplayFeatures(state, geojson, display);
      },
    },
  };
}

export default annotatable(MeasurementMode);
