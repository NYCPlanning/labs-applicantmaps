import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import areaMapLegendConfig from '../../../../utils/area-map-legend-config';

export default class NewProjectMapController extends Controller {
  queryParams = ['mapType'];

  areaMapLegendConfig = areaMapLegendConfig;

  @action
  async save(model) {
    const map = await model.save();

    this.get('notificationMessages').success('Map added!');

    this.transitionToRoute('projects.show', map.get('project'));
  }
}
