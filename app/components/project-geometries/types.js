import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';
import { camelize } from '@ember/string';

// This class takes FIVE arguments: map model mode type target
// prepares dynamic component invocations (for type and mode)
// cleans up input data
// saves data and transitions the router
export default class TypesBase extends Component {
  init(...args) {
    super.init(...args);

    // save the model so it's clean on init
    if (!this.get('isDestroyed') && !this.get('isDestroying')) {
      this.get('geometricPropertyForType').save();
    }
  }

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @argument
  type;

  @argument
  target = 'data';

  @service
  router;

  @service
  store;

  @service
  notificationMessages;

  @computed('type')
  get componentForType() {
    return `project-geometries/types/${this.get('type')}`;
  }

  @computed('mode')
  get componentForMode() {
    return `project-geometries/modes/${this.get('mode')}`;
  }

  @computed('type')
  get geometricPropertyForType() {
    const model = this.get('model');
    const typeName = camelize(this.get('type'));

    return model.get('geometricProperties')
      .findBy('geometryType', typeName);
  }

  @computed('geometricPropertyForType', 'target')
  get geometricPropertyForMode() {
    const target = this.get('target');

    return this.get(`geometricPropertyForType.${target}`);
  }

  set geometricPropertyForMode(featureCollection) {
    const geometricPropertyForType = this.get('geometricPropertyForType');
    const target = this.get('target');

    geometricPropertyForType.set(target, featureCollection);
  }

  @action
  async save() {
    const model = this.get('geometricPropertyForType');

    try {
      await model.save();
      const project = await model.get('project');
      await project.save();

      this.get('notificationMessages').success('Project saved!');
      // only transition to the next step if it's not annotation mode

      this.get('router').transitionTo('projects.show', project);
    } catch (e) {
      this.get('notificationMessages').error(`Something went wrong: ${e}`);
    }
  }

  willDestroyElement() {
    const model = this.get('geometricPropertyForType');

    if (model.hasDirtyAttributes) {
      // roll back attributes if route transitions and there are unsaved changes to the model
      model.rollbackAttributes();
    }
  }
}
