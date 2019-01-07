import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import BaseClass from './-type';

// Underlying Zoning
export const underlyingZoningLayer = {
  id: 'proposed-zoningdistrict-lines',
  type: 'line',
  paint: {
    'line-opacity': 0.5,
    'line-width': 3,
  },
};

export const underlyingZoningLabelsLayer = {
  id: 'proposed-zoningdistrict-labels',
  type: 'symbol',
  layout: {
    'symbol-placement': 'line',
    'text-field': '{label}',
    'text-size': 16,
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
    'text-color': '#444',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': 1,
  },
};

const labelOptions = [
  'BPC',
  'C1-6',
  'C1-6A',
  'C1-7',
  'C1-7A',
  'C1-8',
  'C1-8A',
  'C1-8X',
  'C1-9',
  'C1-9A',
  'C2-6',
  'C2-6A',
  'C2-7',
  'C2-7A',
  'C2-8',
  'C2-8A',
  'C3',
  'C3A',
  'C4-1',
  'C4-2',
  'C4-2A',
  'C4-2F',
  'C4-3',
  'C4-3A',
  'C4-4',
  'C4-4A',
  'C4-4D',
  'C4-4L',
  'C4-5',
  'C4-5A',
  'C4-5D',
  'C4-5X',
  'C4-6',
  'C4-6A',
  'C4-7',
  'C5-1',
  'C5-1A',
  'C5-2',
  'C5-2.5',
  'C5-2A',
  'C5-3',
  'C5-4',
  'C5-5',
  'C5-P',
  'C6-1',
  'C6-1A',
  'C6-1G',
  'C6-2',
  'C6-2A',
  'C6-2G',
  'C6-2M',
  'C6-3',
  'C6-3A',
  'C6-3D',
  'C6-3X',
  'C6-4',
  'C6-4.5',
  'C6-4A',
  'C6-4M',
  'C6-4X',
  'C6-5',
  'C6-5.5',
  'C6-6',
  'C6-6.5',
  'C6-7',
  'C6-7T',
  'C6-9',
  'C7',
  'C8-1',
  'C8-2',
  'C8-3',
  'C8-4',
  'M1-1',
  'M1-1D',
  'M1-1/R5',
  'M1-1/R6A',
  'M1-1/R7-2',
  'M1-1/R7D',
  'M1-2',
  'M1-2D',
  'M1-2/R5B',
  'M1-2/R5D',
  'M1-2/R6',
  'M1-2/R6A',
  'M1-2/R6B',
  'M1-2/R7-2',
  'M1-2/R7A',
  'M1-2/R8',
  'M1-2/R8A',
  'M1-3',
  'M1-3/R7X',
  'M1-3/R8',
  'M1-4',
  'M1-4D',
  'M1-4/R6A',
  'M1-4/R6B',
  'M1-4/R7-2',
  'M1-4/R7A',
  'M1-4/R7D',
  'M1-4/R7X',
  'M1-4/R8A',
  'M1-4/R9A',
  'M1-5',
  'M1-5A',
  'M1-5B',
  'M1-5M',
  'M1-5/R10',
  'M1-5/R7-2',
  'M1-5/R7-3',
  'M1-5/R7X',
  'M1-5/R8A',
  'M1-5/R9',
  'M1-5/R9-1',
  'M1-6',
  'M1-6D',
  'M1-6/R10',
  'M1-6/R9',
  'M2-1',
  'M2-2',
  'M2-3',
  'M2-4',
  'M3-1',
  'M3-2',
  'PARK',
  'R10',
  'R10A',
  'R10H',
  'R1-1',
  'R1-2',
  'R1-2A',
  'R2',
  'R2A',
  'R2X',
  'R3-1',
  'R3-2',
  'R3A',
  'R3X',
  'R4',
  'R4-1',
  'R4A',
  'R4B',
  'R5',
  'R5A',
  'R5B',
  'R5D',
  'R6',
  'R6A',
  'R6B',
  'R7-1',
  'R7-2',
  'R7-3',
  'R7A',
  'R7B',
  'R7D',
  'R7X',
  'R8',
  'R8A',
  'R8B',
  'R8X',
  'R9',
  'R9A',
  'R9X',
];

export default class UnderlyingZoningComponent extends BaseClass {
  constructor(...args) {
    super(...args);

    this.fetchCanonical();
  }

  // this is wrong because it doesn't honor the correct target
  // it should be using the model's API, not passing stuff in directly
  async fetchCanonical() {
    if (isEmpty(this.get('model.canonical'))) {
      const value = await this.get('model').setCanonical();
      const { componentInstance: draw } = this.get('currentMode');

      if (draw) draw.shouldReset(value);
    }
  }

  @service
  currentMode;

  labelOptions=labelOptions

  underlyingZoningLayer = underlyingZoningLayer;

  underlyingZoningLabelsLayer = underlyingZoningLabelsLayer;

  @action
  async calculateRezoningOnSave() {
    const model = this.get('model');
    const project = await model.get('project');

    const rezoningArea = project.get('geometricProperties')
      .findBy('geometryType', 'rezoningArea');

    await rezoningArea.setCanonical();
    await rezoningArea.save();

    // call the passed save closure action
    this.save();
  }
}
