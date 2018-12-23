import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

// Project Area
export const projectAreaLayer = {
  id: 'project-area-line',
  type: 'line',
  layout: {
    visibility: 'visible',
  },
  paint: {
    'line-color': 'rgba(0, 122, 122, 1)',
    'line-width': 2.5,
    'line-dasharray': [3, 1],
  },
};

export const projectAreaIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(0, 122, 122, 1)',
      'stroke-width': 1.25,
      'stroke-dasharray': '3.25,1.75',
    },
  ],
};

export default class ProjectAreaComponent extends Component {
  constructor(...args) {
    super(...args);
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', false);
  }

  @service
  store;

  @service
  notificationMessages;

  @service
  router;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @computed('model.projectArea')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('model').changedAttributes().projectArea || [];

    // console.log('if no initial and proposed');
    if (!initial && proposed) return true;

    // console.log('if no proposed, there are no changes');
    if (!proposed) return false; // no changes are proposed to canonical

    return !isEmpty(this.get('model.projectArea'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('model');
    const notifications = this.get('notificationMessages');

    try {
      const savedProject = await model.save();

      notifications.success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      notifications.success(`Something went wrong: ${e}`);
    }
  }

  willDestroyElement() {
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', true);
  }
}
