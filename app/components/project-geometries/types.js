import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { camelize } from '@ember/string';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';

export default class TypesBase extends Component {
  @service
  router;

  @service
  store;

  @service
  notificationMessages;

  @argument
  type;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @computed('type')
  get projectGeometryType() {
    return `project-geometries/types/${this.get('type')}`;
  }

  @computed('type')
  get geometricPropertyForType() {
    const model = this.get('model');
    const typeName = camelize(this.get('type'));

    return model.get('geometricProperties')
      .findBy('geometryType', typeName);
  }

  @computed('geometricPropertyForType.proposedGeometry')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('geometricPropertyForType').changedAttributes().proposedGeometry || [];

    // if nothing has been proposed at all, no
    // meaningful changes detected
    if (!proposed) return false;

    // only apply this check if this is a canonical geometric prop
    if (this.get('geometricPropertyForType.hasCanonical')) {
      // check that proposed is not the canonical zoning
      if ((!initial || isEmpty(initial)) && proposed) {
        return isFeatureCollectionChanged(this.get('geometricPropertyForType.canonical'), proposed);
      }
    }

    // check for FC-ish empties
    if (isEmpty(initial) && !isEmpty(proposed)) return true;

    // finally, if the proposed is not empty, and it's a meaningful
    // change in the feature collection, proceed
    return !isEmpty(this.get('geometricPropertyForType.proposedGeometry'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('geometricPropertyForType');

    try {
      const savedGeometry = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedGeometry.get('project'));
    } catch (e) {
      this.get('notificationMessages').error(`Something went wrong: ${e}`);
    }
  }

  didReceiveAttrs() {
    // save the model so it's clean on init
    this.get('geometricPropertyForType').save();
  }

  willDestroyElement() {
    const model = this.get('geometricPropertyForType');

    if (model.hasDirtyAttributes) {
      // roll back attributes if route transitions and there are unsaved changes to the model
      model.rollbackAttributes();
    }
  }
}