import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

import { EmptyFeatureCollection } from '../../models/project';
import projectGeometryIcons from '../../utils/project-geom-icons';


export default class ShowProjectController extends Controller {
  EmptyFeatureCollection = EmptyFeatureCollection;

  projectGeometryIcons = projectGeometryIcons;

  @service
  store;

  @computed()
  get taxLotsLayerGroup() {
    return this.get('store').peekRecord('layer-group', 'tax-lots');
  }

  @action
  handleMapLoad(map) {
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }

  @action
  deleteUnderlyingZoning() {
    this.set('model.needUnderlyingZoning', false);
    this.set('model.underlyingZoning', EmptyFeatureCollection);
  }

  @action
  deleteCommercialOverlay() {
    this.set('model.needCommercialOverlay', false);
    this.set('model.commercialOverlays', EmptyFeatureCollection);
  }

  @action
  deleteSpecialDistrict() {
    this.set('model.needSpecialDistrict', false);
    this.set('model.specialPurposeDistricts', EmptyFeatureCollection);
  }
}
