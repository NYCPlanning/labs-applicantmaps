import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isEmpty from '../../utils/is-empty';

// Proposed Special Purpose Districts
const proposedSpecialPurposeDistrictsLayer = {
  id: 'proposed-special-purpose-districts-fill',
  type: 'fill',
  paint: {
    'fill-color': 'rgba(94, 102, 51, 1)',
    'fill-opacity': 0.2,
  },
};

const proposedSpecialPurposeDistrictsLabelsLayer = {
  id: 'proposed-special-purpose-districts-labels',
  type: 'symbol',
  layout: {
    'symbol-placement': 'point',
    'text-field': '{label}',
    'text-size': 12,
    visibility: 'visible',
    'symbol-avoid-edges': false,
    'text-offset': [
      1,
      1,
    ],
    'text-keep-upright': true,
    'symbol-spacing': 200,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
    'text-justify': 'left',
    'text-anchor': 'center',
    'text-max-angle': 90,
  },
  paint: {
    'text-color': 'rgba(70, 76, 38, 1)',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': 1,
  },
};

export default class specialPurposeDistrictsComponent extends Component {
  init(...args) {
    super.init(...args);

    if (isEmpty(this.get('model.specialPurposeDistricts'))) {
      this.get('model').setDefaultSpecialPurposeDistricts();
    }
  }

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

  proposedSpecialPurposeDistrictsLayer = proposedSpecialPurposeDistrictsLayer;

  proposedSpecialPurposeDistrictsLabelsLayer = proposedSpecialPurposeDistrictsLabelsLayer;

  @action
  async save(finalGeometry) {
    const model = this.get('model');
    const featureCollection = await finalGeometry;

    model.set('specialPurposeDistricts', featureCollection);

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
