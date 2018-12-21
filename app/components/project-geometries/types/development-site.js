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
    return !isEmpty(this.get('model.developmentSite'))
      && isFeatureCollectionChanged(this.get('model'), 'developmentSite');
  }

  @action
  async save() {
    const model = this.get('model');

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }

  willDestroyElement() {
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', true);
  }
}
