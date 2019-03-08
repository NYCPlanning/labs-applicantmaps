import length from '@turf/length';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


/** *************** DIRECT SELECT FOR POLYGON LABEL ENFORCEMENT MODE ****************** */
/* see https://github.com/NYCPlanning/labs-applicantmaps/issues/417 for full context about this mode */
function isUnlabeledPolygon(feature) {
  // not polygon
  if (feature.type !== 'Polygon') {
    return false;
  }

  // labeled polygon
  if (feature.properties.label) {
    return false;
  }

  // unlabeled polygon
  return true;
}

export const DirectSelect_RequiresPolygonLabelMode = { ...MapboxDraw.modes.direct_select };

/* If the geometry we just drew is a polygon,
 * then, check if the polygon is missing a label. If it is,
 * then, block switching draw/annotation modes until label is created. Else,
 * call parent onClick() from original direct_select mode to return to normal behavior.
 *
 * NOTE: use changeMode to trigger draw.selectionchange event, which triggers
 * selectedFeatureCallback in the draw map object for feature post processing.
 * Required b/c adding a top-level feature here does not persist back to draw map context
 */
DirectSelect_RequiresPolygonLabelMode.onClick = function(state, e) {
  const selected = this.getSelected();
  if (selected.length && isUnlabeledPolygon(selected[0])) {
    selected[0].properties.missingLabel = true;
    this.changeMode('direct_select', { featureId: selected[0].id });
    return;
  }

  MapboxDraw.modes.direct_select.onClick.apply(this, [state, e]);
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
