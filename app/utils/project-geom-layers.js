// Development Site
const developmentSiteLayer = {
  type: 'line',
  paint: {
    'line-color': 'rgba(237, 18, 18, 1)',
    'line-width': 2.5,
    'line-dasharray': [2.5, 1, 1, 1],
  },
};

const developmentSiteIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(237, 18, 18, 1)',
      'stroke-width': 1.25,
      'stroke-dasharray': '3,1.25,1.25,1.25',
    },
  ],
};


// Project Area
const projectAreaLayer = {
  type: 'line',
  paint: {
    'line-color': 'rgba(0, 122, 122, 1)',
    'line-width': 2.5,
    'line-dasharray': [3, 1],
  },
};

const projectAreaIcon = {
  type: 'line',
  layers: [
    {
      stroke: 'rgba(0, 122, 122, 1)',
      'stroke-width': 1.25,
      'stroke-dasharray': '3.25,1.75',
    },
  ],
};


// Rezoning Area
const rezoningAreaLayer = {
  type: 'line',
  paint: {
    'line-color': 'rgba(0, 0, 0, 1)',
    'line-width': 3,
    'line-dasharray': [0, 2],
  },
  layout: {
    'line-cap': 'round',
  },
};

const rezoningAreaIcon = {
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


export default {
  developmentSiteLayer,
  developmentSiteIcon,
  projectAreaLayer,
  projectAreaIcon,
  rezoningAreaLayer,
  rezoningAreaIcon,
};
