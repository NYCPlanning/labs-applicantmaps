import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import turfBbox from 'npm:@turf/bbox';

export default class NewProjectMapController extends Controller {
  @service
  notificationMessages;

  developmentSiteLayer = {
    id: 'development-site-line',
    type: 'line',
    paint: {
      'line-width': 2,
      'line-color': 'red',
    },
  }

  projectAreaLayer = {
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
  }

  projectBufferLayer = {
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
  }

  @action
  handleMapLoaded(map) {
    const buffer = this.get('model.project.projectGeometryBuffer');

    map.fitBounds(turfBbox.default(buffer), {
      padding: 100,
      duration: 0,
    });
  }

  @action
  async save(model) {
    const map = await model.save();

    this.get('notificationMessages').success('Map added!');

    this.transitionToRoute('projects.edit', map.get('project'));
  }
}
