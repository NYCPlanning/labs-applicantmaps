import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { tagName } from '@ember-decorators/component';
import { Promise } from 'rsvp';

export default
@tagName('')
class ProjectFormComponent extends Component {
  // // @argument('object')
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
