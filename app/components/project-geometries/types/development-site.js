import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';

export const developmentSiteLayer = {
  id: 'development-site-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(237, 18, 18, 1)',
    'line-width': 4.5,
    'line-dasharray': [2.5, 1, 1, 1],
  },
};

export default class DevelopmentSiteComponent extends Component {
  constructor(...args) {
    super(...args);
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', false);
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

  @computed('model.developmentSite')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('model').changedAttributes().developmentSite || [];

    // console.log('if no initial and proposed');
    if (!initial && proposed) return true;

    // console.log('if no proposed, there are no changes');
    if (!proposed) return false; // no changes are proposed to canonical

    if (isEmpty(initial) && !isEmpty(proposed)) return true;

    return !isEmpty(this.get('model.developmentSite'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('model');

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').error(`Something went wrong: ${e}`);
    }
  }

  willDestroyElement() {
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', true);
  }
}
