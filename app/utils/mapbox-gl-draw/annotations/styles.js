export default [
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 4,
      'line-opacity': 0.4,
    },
  },

  {
    id: 'gl-draw-line-label',
    type: 'symbol',
    filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'text-field': '{label}',
      'symbol-placement': 'line-center',
      'text-offset': [
        0,
        -0.75,
      ],
      'text-justify': 'center',
      'text-anchor': 'center',
    },
  },

  {
    id: 'gl-draw-arrow',
    type: 'symbol',
    filter: ['all', ['==', 'meta', 'arrow'], ['==', '$type', 'Point']],
    layout: {
      'icon-image': 'arrow',
      'icon-size': 0.075,
      'icon-rotate': {
        type: 'identity',
        property: 'rotation',
      },
      'icon-anchor': 'top',
    },
  },

  // vertex point halos
  {
    id: 'gl-draw-polygon-and-line-vertex-halo-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#FFF',
    },
  },
  // vertex points
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#D96B27',
    },
  },

  // radius label
  {
    id: 'gl-draw-radius-label',
    type: 'symbol',
    filter: ['==', 'meta', 'currentPosition'],
    layout: {
      'text-field': '{radiusFeet} \n {radiusMiles}',
      'text-anchor': 'left',
      'text-offset': [
        1,
        0,
      ],
      'text-size': 22,
    },
    paint: {
      'text-color': 'rgba(0, 0, 0, 1)',
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': 3,
      'icon-opacity': {
        base: 1,
        stops: [
          [
            7.99,
            1,
          ],
          [
            8,
            0,
          ],
        ],
      },
      'text-halo-blur': 1,
    },
  },

  // INACTIVE (static, already drawn)
  // line stroke
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#9932CC',
      'line-width': 5,
    },
  },
];
