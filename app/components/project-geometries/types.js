import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { camelize } from '@ember/string';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';

// returns true or false based on whether the change to the geometric
// property was "meaningful"
// first argument is a geometric-property model
export function isMeaningfulChange(geometricPropertyForType /* model */) {
  // here, it gets set once by the constructor
  // const initial = model.get(attribute);
  const [
    initial,
    proposed, // upstream proposed should always be FC
  ] = geometricPropertyForType.changedAttributes().proposedGeometry || [];

  // if nothing has been proposed at all, no
  // meaningful changes detected
  if (!proposed) return false;

  // only apply this check if this is a canonical geometric prop
  if (geometricPropertyForType.get('hasCanonical')) {
    // check that proposed is not the canonical zoning
    if ((!initial || isEmpty(initial)) && proposed) {
      return isFeatureCollectionChanged(geometricPropertyForType.get('canonical'), proposed);
    }
  }

  // check for FC-ish empties
  if (isEmpty(initial) && !isEmpty(proposed)) return true;

  // finally, if the proposed is not empty, and it's a meaningful
  // change in the feature collection, proceed
  return !isEmpty(geometricPropertyForType.get('proposedGeometry'))
    && isFeatureCollectionChanged(initial, proposed);
}

// This class takes FIVE arguments: map model mode type target
// prepares dynamic component invocations (for type and mode)
// cleans up input data
// saves data and transitions the router
export default class TypesBase extends Component {
  constructor(...args) {
    super(...args);

    // save the model so it's clean on init
    this.get('geometricPropertyForType').save();
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

  @computed('geometricPropertyForType.{canonical,proposedGeometry,annotations,data}')
  get isReadyToProceed() {
    return isMeaningfulChange(this.get('geometricPropertyForType'));
  }

  @action
  async save() {
    const model = this.get('geometricPropertyForType');

    try {
      await model.save();

      const project = await model.get('project');
      project.save();

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
