const developmentSiteIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(237, 18, 18, 1)',
      'stroke-width': 1.25,
      'stroke-dasharray': '3,1.25,1.25,1.25',
    },
  ],
};

const projectAreaIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(0, 122, 122, 1)',
      'stroke-width': 1,
      'stroke-dasharray': '3.25,1.75',
    },
  ],
};

const underlyingZoningIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(0, 0, 0, 0.7)',
      'stroke-width': 1,
    },
  ],
};

const commercialOverlaysIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(0, 0, 0, 0.7)',
      'stroke-width': 1,
    },
  ],
};

const specialPurposeDistrictsIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(94, 102, 51, 0.2)',
      stroke: 'rgba(0, 0, 0, 0)',
      'stroke-width': 0,
    },
  ],
};

const rezoningAreaIcon = {
  type: 'rectangle',
  layers: [
    {
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(0, 0, 0, 1)',
      'stroke-width': 2,
      'stroke-dasharray': '0.2,4',
      'stroke-linecap': 'round',
    },
  ],
};

export default {
  developmentSiteIcon,
  projectAreaIcon,
  underlyingZoningIcon,
  commercialOverlaysIcon,
  specialPurposeDistrictsIcon,
  rezoningAreaIcon,
};
