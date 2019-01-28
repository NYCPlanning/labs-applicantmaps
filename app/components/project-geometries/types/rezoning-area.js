import BaseClass from './-type';

export const rezoningAreaLayer = {
  type: 'line',
  paint: {
    'line-color': 'rgba(0, 0, 0, 1)',
    'line-width': 9,
    'line-dasharray': [0, 2],
  },
  layout: {
    'line-cap': 'round',
  },
};

export const rezoningAreaIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(0, 0, 0, 1)',
      'stroke-width': 2,
      'stroke-dasharray': '0.2,4',
      'stroke-linecap': 'round',
    },
  ],
};

export default class RezoningArea extends BaseClass {
  rezoningAreaLayer = rezoningAreaLayer;
}
