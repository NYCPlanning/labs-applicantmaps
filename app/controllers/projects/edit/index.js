import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import turfBbox from 'npm:@turf/bbox';

import projectGeomLayers from '../../../utils/project-geom-layers';

export default class ProjectIndexController extends Controller {
  projectGeomLayers = projectGeomLayers

  @action
  handleMapLoad(map) { // eslint-disable-line
    window.map = map;

    // build a geojson FeatureCollection from all three project geoms
    const FC = {
      type: 'FeatureCollection',
      features: [],
    };

    const developmentSite = this.get('model.developmentSite');
    const projectArea = this.get('model.projectArea');
    const rezoningArea = this.get('model.rezoningArea');

    [developmentSite, projectArea, rezoningArea].forEach((geometry) => {
      if (geometry) {
        FC.features.push({
          type: 'Feature',
          geometry,
        });
      }
    });

    map.fitBounds(turfBbox.default(FC), {
      padding: 50,
      duration: 0,
    });
  }
}
