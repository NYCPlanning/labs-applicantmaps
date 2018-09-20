import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import turfBbox from 'npm:@turf/bbox';

import areaMapLegendConfig from '../../../../utils/area-map-legend-config';

const developmentSiteLayer = {
  id: 'development-site-line',
  type: 'line',
  paint: {
    'line-width': 2,
    'line-color': 'red',
  },
};

const projectAreaLayer = {
  id: 'project-area-line',
  type: 'line',
  layout: {
    visibility: 'visible',
    'line-cap': 'round',
  },
  paint: {
    'line-width': 6,
    'line-dasharray': [
      0.1,
      2,
    ],
  },
};

const projectBufferLayer = {
  id: 'project-buffer-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(116, 4, 80, 1)',
    'line-width': 6,
    'line-dasharray': [
      0.5,
      0.5,
    ],
  },
};

export default class NewProjectMapController extends Controller {
  @service
  notificationMessages;

  developmentSiteLayer = developmentSiteLayer

  projectAreaLayer = projectAreaLayer

  projectBufferLayer = projectBufferLayer

  areaMapLegendConfig = areaMapLegendConfig

  mapInstance = null

  mapPitch = null

  mapBearing = null

  @computed('mapBearing', 'mapPitch')
  get northArrowTransforms() {
    const bearing = this.get('mapBearing');
    const pitch = this.get('mapPitch');

    return {
      arrow: `transform: rotateX(${pitch}deg) rotate(${360 - bearing}deg)`,
      n: `transform: rotate(${360 - bearing}deg)`,
      nSpan: `transform: rotate(${(360 - bearing) * -1}deg)`,
    };
  }

  @action
  handleMapLoaded(map) {
    this.set('mapInstance', map);
    const buffer = this.get('model.project.projectGeometryBuffer');

    map.fitBounds(turfBbox.default(buffer), {
      padding: 100,
      duration: 0,
    });

    this.handleMapRotateOrPitch();
  }

  @action
  handleMapRotateOrPitch() {
    const map = this.get('mapInstance');
    this.set('mapBearing', map.getBearing());
    this.set('mapPitch', map.getPitch());
  }

  @action
  async save(model) {
    const map = await model.save();

    this.get('notificationMessages').success('Map added!');

    this.transitionToRoute('projects.edit', map.get('project'));
  }
}
