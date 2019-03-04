import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import { Promise } from 'rsvp';

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

    // the project, when it's created, needs to save all the related models
    // again, this should happen in the server
    await Promise.all(project.get('geometricProperties').map(geom => geom.save()));

    this.get('notificationMessages').success('Project saved!');

    this.get('router').transitionTo('projects.show', project);
  }
}
