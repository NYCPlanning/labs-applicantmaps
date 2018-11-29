import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

// Project Area
export const projectAreaLayer = {
  id: 'project-area-line',
  type: 'line',
  layout: {
    visibility: 'visible',
  },
  paint: {
    'line-color': 'rgba(0, 122, 122, 1)',
    'line-width': 2.5,
    'line-dasharray': [3, 1],
  },
};

export const projectAreaIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(0, 122, 122, 1)',
      'stroke-width': 1.25,
      'stroke-dasharray': '3.25,1.75',
    },
  ],
};

export default class ProjectAreaComponent extends Component {
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

  projectAreaLayer = projectAreaLayer;

  @action
  async save() {
    const model = this.get('model');
    const notifications = this.get('notificationMessages');

    try {
      const savedProject = await model.save();

      notifications.success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      notifications.success(`Something went wrong: ${e}`);
    }
  }
}
