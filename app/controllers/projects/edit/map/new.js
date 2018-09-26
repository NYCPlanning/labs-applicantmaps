import Controller from '@ember/controller';
import areaMapLegendConfig from '../../../../utils/area-map-legend-config';

export default class NewProjectMapController extends Controller {
  queryParams = ['mapType'];

  areaMapLegendConfig = areaMapLegendConfig;
}
