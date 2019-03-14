import { inject as service } from '@ember-decorators/service';
import BaseClass from './-type';

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

export default class ProjectAreaComponent extends BaseClass {
  constructor(...args) {
    super(...args);
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', false);
  }

  @service
  store;

  willDestroyElement() {
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', true);
  }
}
