import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import turfBbox from 'npm:@turf/bbox';

import areaMapLegendConfig from '../../../../utils/area-map-legend-config';

export default class NewProjectMapController extends Controller {
  queryParams = ['mapType'];

  areaMapLegendConfig = areaMapLegendConfig;
}
