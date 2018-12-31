import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isEmpty from '../../../utils/is-empty';

export const rezoningAreaLayer = {
  type: 'line',
  paint: {
    'line-color': 'rgba(0, 0, 0, 1)',
    'line-width': 9,
    'line-dasharray': [0, 2],
  },
  layout: {
    'line-cap': 'round',
  },
};

export const rezoningAreaIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(0, 0, 0, 1)',
      'stroke-width': 2,
      'stroke-dasharray': '0.2,4',
      'stroke-linecap': 'round',
    },
  ],
};

export default class RezoningArea extends Component {
  init(...args) {
    super.init(...args);

    const model = this.get('model');

    if (isEmpty(this.get('model.proposedGeometry'))) {
      model.get('project').then((project) => {
        project.setRezoningArea();
      });
    }
  }

  rezoningAreaLayer = rezoningAreaLayer;

  @service
  notificationMessages;

  @service
  router;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @action
  async save() {
    const model = this.get('model');
    const notifications = this.get('notificationMessages');

    try {
      await model.save();

      notifications.success('Project saved!');
      this.get('router').transitionTo('projects.show', model);
    } catch (e) {
      notifications.error(`Something went wrong: ${e}`);
    }
  }
}
