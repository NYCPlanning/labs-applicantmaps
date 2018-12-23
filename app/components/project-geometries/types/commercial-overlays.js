import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
import isEmpty from '../../../utils/is-empty';

const labelOptions = [
  'C1-1',
  'C1-2',
  'C1-3',
  'C1-4',
  'C1-5',
  'C2-1',
  'C2-2',
  'C2-3',
  'C2-4',
  'C2-5',
];

// Proposed Commercial Overlays
export const commercialOverlaysLayer = {
  id: 'commemrcial-overlays-lines',
  type: 'line',
  paint: {
    'line-opacity': 0.5,
    'line-width': 3,
  },
};


export const coLayer = {
  id: 'co_outline',
  type: 'line',
  paint: {
    'line-width': 1,
    'line-color': 'rgba(33, 35, 38, 1)',
  },
};

export const c11Layer = {
  id: 'c1-1',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C1-1']],
};

export const c12Layer = {
  id: 'c1-2',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45-135',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C1-2']],
};

export const c13Layer = {
  id: 'c1-3',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_altbold',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C1-3']],
};

export const c14Layer = {
  id: 'c1-4',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_altbold-135_altbold',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C1-4']],
};

export const c15Layer = {
  id: 'c1-5',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_dash',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C1-5']],
};

export const c21Layer = {
  id: 'c2-1',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45-dot',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C2-1']],
};

export const c22Layer = {
  id: 'c2-2',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45-135-dot',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C2-2']],
};

export const c23Layer = {
  id: 'c2-3',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_altbold-dot',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C2-3']],
};

export const c24Layer = {
  id: 'c2-4',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_altbold-135_altbold-dot',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C2-4']],
};

export const c25Layer = {
  id: 'c2-5',
  type: 'fill',
  paint: {
    'fill-pattern': 'black-45_dash-dot',
    'fill-opacity': 0.7,
  },
  filter: ['all', ['==', 'label', 'C2-5']],
};

export default class CommercialOverlayComponent extends Component {
  init(...args) {
    super.init(...args);

    if (isEmpty(this.get('model.commercialOverlays'))) {
      this.get('model').setDefaultCommercialOverlays();
    }
  }

  labelOptions=labelOptions

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @service
  router;

  @service
  notificationMessages;

  coLayer = coLayer;

  c11Layer = c11Layer;

  c12Layer = c12Layer;

  c13Layer = c13Layer;

  c14Layer = c14Layer;

  c15Layer = c15Layer;

  c21Layer = c21Layer;

  c22Layer = c22Layer;

  c23Layer = c23Layer;

  c24Layer = c24Layer;

  c25Layer = c25Layer;

  @computed('model.commercialOverlays')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('model').changedAttributes().commercialOverlays || [];
    console.log(initial, proposed, this.get('model').changedAttributes());
    // console.log('if no initial and proposed');
    // check that proposed is not the original
    // new models default values are honored
    // after they're saved
    if ((!initial || isEmpty(initial)) && proposed) {
      return isFeatureCollectionChanged(this.get('model.originalCommercialOverlays'), proposed);
    }

    // console.log('if no proposed, there are no changes');
    if (!proposed) return false; // no changes are proposed to canonical

    return !isEmpty(this.get('model.commercialOverlays'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('model');

    // because we've just changed the proposed zoning,
    // we should also calculate the rezoning area
    await model.setRezoningArea();

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
