import Component from '@ember/component';
import { get } from '@ember/object';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { containsNumber } from '@turf/invariant';
import { EmptyFeatureCollection } from 'labs-applicant-maps/models/geometric-property';

export function currentFeatureIsComplete(currentMode, feature) {
  if (currentMode === 'direct_select' && feature) {
    if (feature.geometry.type === 'Polygon') {
      if (!feature.properties.label) {
        // set special polygon feature flag, used to require used to label their polygons in draw mode
        return false;
      }
    }
  }

  return true;
}

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    this.callbacks = {
      drawState: () => this.drawStateCallback(),
      selectedFeature: () => this.selectedFeatureCallback(),
      skipToDirectSelect: () => this.skipToDirectSelectCallback(),
    };

    this._bindCallbacks();
  }

  _bindCallbacks() {
    const { mapInstance } = this.get('map');

    mapInstance.on('draw.create', this.callbacks.drawState);
    mapInstance.on('draw.update', this.callbacks.drawState);
    mapInstance.on('draw.delete', this.callbacks.drawState);
    mapInstance.on('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.on('draw.selectionchange', this.callbacks.skipToDirectSelect);
    mapInstance.on('draw.modechange', this.callbacks.selectedFeature);
  }

  // upstream set to model
  drawStateCallback() {
    const drawnFeatures = this.get('drawnFeatures');
    this.set('geometricProperty', drawnFeatures);
  }

  // Simply gets what new feature is selected and sets it to the class
  // disallows multiply selectable polygon and line features
  // point features can still be selected as groups
  selectedFeatureCallback() {
    const { draw: { drawInstance: draw }, mapInstance } = this.get('map');
    const { features: [firstSelectedFeature] } = draw.getSelected();
    const [selectedId] = draw.getSelectedIds();

    if (firstSelectedFeature) {
      /* Bring properties.missingLabel up to top-level property
       * Must be top-level for watching in the feature-label-form,
       * but cannot be added as top-level in the overriden mapbox-gl-draw mode event
       * (See https://github.com/NYCPlanning/labs-applicantmaps/issues/417)
       */
      if ('missingLabel' in firstSelectedFeature.properties) {
        firstSelectedFeature.missingLabel = firstSelectedFeature.properties.missingLabel;
      }
      this.set('selectedFeature', { type: 'FeatureCollection', features: [firstSelectedFeature] });

      const mode = get(firstSelectedFeature, 'properties.meta:mode');

      // what is this doing? why do we need to manually alter filters?
      if (mode) {
        const originalFilter = mapInstance
          .getFilter('gl-draw-polygon-midpoint.cold');

        originalFilter.push(['!=', 'parent', selectedId]);
        mapInstance.setFilter('gl-draw-polygon-midpoint.cold', originalFilter);
        mapInstance.setFilter('gl-draw-polygon-midpoint.hot', originalFilter);
      }
    } else {
      this.set('selectedFeature', EmptyFeatureCollection);
    }
  }

  // skip simple_select mode, jump straight to direct_select
  // mode so users can immediately select vertices
  // this helps avoid an additional click when something is selected
  skipToDirectSelectCallback() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const mode = draw.getMode();
    const [selectedID] = draw.getSelectedIds();
    const { features: [{ geometry: { type } = {} } = {}] } = draw.getSelected();

    // can't direct select a point
    if (selectedID && type !== 'Point' && mode === 'simple_select') {
      draw.changeMode('direct_select', { featureId: selectedID });
    }

    this.set('tool', mode);
  }

  // Get drawn features, if they're valid
  // We need to remove weird null coordinates.
  // This makes the component expect a certain type of FC
  // which is bad.
  // See https://github.com/mapbox/mapbox-gl-draw/issues/774
  @computed('geometricProperty')
  get drawnFeatures() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const features = draw.getAll().features
      .filter(({ geometry: { coordinates } }) => containsNumber(coordinates));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  @computed('tool')
  get currentTool() {
    return this.get('tool');
  }

  @argument
  tool;

  // @required
  // mapbox-gl map context with draw instance
  @argument
  map;

  // @type(FeatureCollection)
  @argument
  geometricProperty;

  // @type(FeatureCollection)
  selectedFeature = EmptyFeatureCollection;

  @service
  notificationMessages;

  /*
   * Handles trash button click in draw mode
   * To be able to delete all features regardless of current draw mode,
   * we cannot always rely on draw.trash(), which is mode-specific.
   * When a single point of a larger feature is selected, we use draw.trash()
   * to delete a single polygon vertex, or an entire line (behavior provided by trash()).
   * When an entire feature is selected (full polygon, line or point type), we rely on draw.delete(),
   * deleting all selected features by id
   */
  @action
  handleTrashButtonClick() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const { features: [selectedFeaturePoint] } = draw.getSelectedPoints();
    const { features: [selectedFeature] } = draw.getSelected();

    // if user attempts to delete a vertex that renders the polygon invalid (i.e. < 4 vertices)
    // then select the entire polygon Feature for deletion in simple_select_delete mode
    if (selectedFeaturePoint
        && selectedFeature.geometry.type === 'Polygon'
        && selectedFeature.geometry.coordinates[0].length < 5) {
      draw.changeMode('simple_select_delete', { featureIds: [selectedFeature.id] });
    }

    // if user selects entire Feature(s) (polygon, line, or point(s)) for deletion
    // then switch to simple_select_delete mode (cannot delete entire Feature in direct_select mode)
    if (!selectedFeaturePoint && !['simple_select', 'simple_select_delete'].includes(draw.getMode())) {
      const selectedFeatureIds = draw.getSelectedIds();
      draw.changeMode('simple_select_delete', { featureIds: selectedFeatureIds });
    }

    draw.trash();
    this.drawStateCallback();
  }

  @action
  updateSelectedFeature(property, value) {
    const { draw: { drawInstance: draw } } = this.get('map');
    const { features: [firstFeature] } = this.get('selectedFeature');


    draw.setFeatureProperty(firstFeature.id, property, value);

    // update special polygon feature flag used to require users to label their polygons
    this.set('selectedFeature.features.firstObject.missingLabel', false);

    // this triggers an update that renders the new label as mutated above to show up in the selected feature
    // see https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md#events
    this.drawStateCallback();
  }

  @action
  handleDrawButtonClick() {
    const currentMode = this.map.draw.drawInstance.getMode();
    const { features: [firstFeature] } = this.get('selectedFeature') || { features: [] };

    if (!currentFeatureIsComplete(currentMode, firstFeature)) {
      // set special polygon feature flag, used to require used to label their polygons in draw mode
      this.set('selectedFeature.features.firstObject.missingLabel', true);
      // block mode switch
      return;
    }

    this.map.draw.drawInstance.changeMode('draw_polygon');
    this.set('tool', 'draw_polygon');
  }

  @action
  handleAnnotation(mode) {
    // require a user to finish drawing their polygon
    const currentMode = this.map.draw.drawInstance.getMode();
    if (currentMode === 'draw_polygon') {
      return;
    }

    // require a user to label their finished polygon
    const { features: [firstFeature] } = this.get('selectedFeature') || { features: [] };
    if (!currentFeatureIsComplete(currentMode, firstFeature)) {
      // set special polygon feature flag, used to require used to label their polygons in draw mode
      this.set('selectedFeature.features.firstObject.missingLabel', true);
      // block mode switch
      return;
    }

    this.map.draw.drawInstance.changeMode(mode);
    this.set('tool', mode);
  }

  /* =================================================
  =            COMPONENT LIFECYCLE HOOKS            =
  ================================================= */
  didInsertElement(...params) {
    const { draw: { shouldReset } } = this.get('map');

    shouldReset(this.get('geometricProperty'));

    super.didInsertElement(...params);
  }

  willDestroyElement(...args) {
    const { mapInstance } = this.get('map');

    mapInstance.off('draw.create', this.callbacks.drawState);
    mapInstance.off('draw.update', this.callbacks.drawState);
    mapInstance.off('draw.delete', this.callbacks.drawState);
    mapInstance.off('draw.modechange', this.callbacks.selectedFeature);
    mapInstance.off('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.off('draw.selectionchange', this.callbacks.skipToDirectSelect);

    super.willDestroyElement(...args);
  }
}
