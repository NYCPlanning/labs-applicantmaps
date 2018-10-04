// Development Site
const developmentSiteLayer = {
  id: 'development-site-line',
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
    'line-width': 9,
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


// Project Buffer
const projectBufferLayer = {
  id: 'project-buffer-line',
  type: 'line',
  paint: {
    'line-color': 'rgba(122, 0, 72, 1)',
    'line-width': 3,
    'line-dasharray': [
      0.75,
      0.75,
    ],
  },
};

// Proposed Zoning
const proposedZoningLayer = {
  id: 'proposed-zoningdistrict-lines',
  type: 'line',
  paint: {
    'line-opacity': 0.5,
    'line-width': 3,
  },
};

const proposedZoningLabelsLayer = {
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


// Proposed Commercial Overlays
const proposedCommercialOverlaysLayer = {
  id: 'proposed-commercial-overlays-lines',
  type: 'line',
  paint: {
    'line-color': 'rgba(237, 18, 18, 1)',
    'line-opacity': 0.5,
    'line-width': 3,
  },
};

const proposedCommercialOverlaysLabelsLayer = {
  id: 'proposed-commercial-overlays-labels',
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
    'text-color': 'rgba(237, 18, 18, 1)',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': 1,
  },
};


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


export default {
  developmentSiteLayer,
  developmentSiteIcon,
  projectAreaLayer,
  projectAreaIcon,
  rezoningAreaLayer,
  rezoningAreaIcon,
  projectBufferLayer,
  proposedZoningLayer,
  proposedZoningLabelsLayer,
  proposedCommercialOverlaysLayer,
  proposedCommercialOverlaysLabelsLayer,
  proposedSpecialPurposeDistrictsLayer,
  proposedSpecialPurposeDistrictsLabelsLayer,
};
