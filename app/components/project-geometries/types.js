import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { camelize } from '@ember/string';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';

export default class TypesBase extends Component {
  constructor(...args) {
    super(...args);

    // save the model so it's clean on init
    this.get('geometricPropertyForType').save();
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

  @argument
  type;

  @argument
  target = 'data';

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
    const mode = this.get('mode');

    featureCollection.features.forEach((feature) => {
      if (!feature.properties['meta:mode']) {
        feature.properties['meta:mode'] = mode;
      }
    });

    geometricPropertyForType.set(target, featureCollection);
  }

  @computed('geometricPropertyForType.{canonical,proposedGeometry,annotations}')
  get isReadyToProceed() {
    // short-circuit this if we're in annotation mode
    if (this.get('mode') === 'draw/annotation') return true;

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

      // only transition to the next step if it's not annotation mode
      this.get('router').transitionTo('projects.show', savedGeometry.get('project'));
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
