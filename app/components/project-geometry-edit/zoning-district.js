import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

// Proposed Zoning
export const proposedZoningLayer = {
  id: 'proposed-zoningdistrict-lines',
  type: 'line',
  paint: {
    'line-opacity': 0.5,
    'line-width': 3,
  },
};

export const proposedZoningLabelsLayer = {
  id: 'proposed-zoningdistrict-labels',
  type: 'symbol',
  layout: {
    'symbol-placement': 'line',
    'text-field': '{label}',
    'text-size': 16,
    visibility: 'visible',
    'symbol-avoid-edges': false,
    'text-offset': [
      1,
      1,
    ],
    'text-keep-upright': true,
    'symbol-spacing': 200,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
    'text-justify': 'left',
    'text-anchor': 'center',
    'text-max-angle': 90,
  },
  paint: {
    'text-color': '#444',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': 1,
  },
};

export default class ZoningDistrictComponent extends Component {
  init(...args) {
    super.init(...args);

    if (!this.get('model.proposedZoning')) {
      this.get('model').setDefaultProposedZoning();
    }
  }

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @service
  router;

  @service
  notificationMessages;

  proposedZoningLayer = proposedZoningLayer;

  proposedZoningLabelsLayer = proposedZoningLabelsLayer;

  @action
  async save(finalGeometry) {
    const model = this.get('model');
    const featureCollection = await finalGeometry;

    model.set('proposedZoning', featureCollection);

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
