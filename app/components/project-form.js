import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ProjectFormComponent extends Component {
  @argument
  model;

  @service
  notificationMessages;

  @service
  router;

  @action
  async save(model) {
    const project = await model.save();

    this.get('notificationMessages').success('Project saved!');

    this.get('router').transitionTo('projects.show', project);
  }
}
