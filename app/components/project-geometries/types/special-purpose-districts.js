import { action } from '@ember-decorators/object';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import { service } from '@ember-decorators/service';
import BaseClass from './-type';

// Proposed Special Purpose Districts
export const specialPurposeDistrictsLayer = {
  id: 'proposed-special-purpose-districts-fill',
  type: 'fill',
  paint: {
    'fill-color': 'rgba(94, 102, 51, 1)',
    'fill-opacity': 0.2,
  },
};

export const specialPurposeDistrictsLabelsLayer = {
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

export default class specialPurposeDistrictsComponent extends BaseClass {
  constructor(...args) {
    super(...args);

    this.fetchCanonical();
  }

  async fetchCanonical() {
    if (isEmpty(this.get('model.canonical'))) {
      const value = await this.get('model').setCanonical();
      const { componentInstance: draw } = this.get('currentMode');

      if (draw) {
        draw.shouldReset(value);
      }
    }
  }

  @service
  currentMode;

  specialPurposeDistrictsLayer = specialPurposeDistrictsLayer;

  specialPurposeDistrictsLabelsLayer = specialPurposeDistrictsLabelsLayer;

  @action
  async calculateRezoningOnSave() {
    const model = this.get('model');
    const project = await model.get('project');

    await project.setRezoningArea();
    this.save();
  }
}
