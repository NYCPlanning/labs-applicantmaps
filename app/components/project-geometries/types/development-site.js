import TypesBaseComponent from '../-types';

export const developmentSiteLayer = {
  id: 'development-site-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(237, 18, 18, 1)',
    'line-width': 4.5,
    'line-dasharray': [2.5, 1, 1, 1],
  },
};

export default class DevelopmentSiteComponent extends TypesBaseComponent {
  constructor(...args) {
    super(...args);

    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', false);
  }

  willDestroyElement() {
    const zoningDistricts = this.get('store').peekRecord('layer-group', 'zoning-districts');

    if (zoningDistricts && !this.get('isDestroyed')) zoningDistricts.set('visible', true);
  }
}
