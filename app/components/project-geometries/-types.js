import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';

export default class TypesBase extends Component {
  init(...args) {
    super.init(...args);

    if (isEmpty(this.get('model.canonical'))) {
      this.get('model').setCanonical();
    }
  }

  @service
  router;

  @service
  store;

  @service
  notificationMessages;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @computed('model.proposedGeometry')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('model').changedAttributes().proposedGeometry || [];

    // if nothing has been proposed at all, no
    // meaningful changes detected
    if (!proposed) return false;

    // only apply this check if this is a canonical geometric prop
    if (this.get('model.hasCanonical')) {
      // check that proposed is not the canonical zoning
      if ((!initial || isEmpty(initial)) && proposed) {
        return isFeatureCollectionChanged(this.get('model.canonical'), proposed);
      }
    }

    // check for FC-ish empties
    if (isEmpty(initial) && !isEmpty(proposed)) return true;

    // finally, if the proposed is not empty, and it's a meaningful
    // change in the feature collection, proceed
    return !isEmpty(this.get('model.proposedGeometry'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('model');

    try {
      const savedGeometry = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedGeometry.get('project'));
    } catch (e) {
      this.get('notificationMessages').error(`Something went wrong: ${e}`);
    }
  }
}
