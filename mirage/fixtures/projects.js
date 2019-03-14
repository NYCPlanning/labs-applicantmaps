export default [
  {
    id: 12,
    annotations: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          'meta:mode': 'draw_annotations:linear',
          label: '29 ft',
        },
        geometry: {
          coordinates: [
            [
              -73.91311260409391,
              40.75817100752687,
            ],
            [
              -73.91314440749528,
              40.75808962172928,
            ],
          ],
          type: 'LineString',
        },
      }],
    },
    projectName: 'test',
    applicantName: 'test',
    zapProjectId: 'test',
    needProjectArea: false,
    needRezoning: false,
    needUnderlyingZoning: false,
    needCommercialOverlay: false,
    needSpecialDistrict: false,
    geometricPropertyIds: [1, 2],
  },
  {
    id: 11,
    projectName: 'Test Project 9',
    applicantName: 'Firstname M. Longlastname',
    zapProjectId: 'P1234567890',
    needProjectArea: true,
    needRezoning: true,
    needUnderlyingZoning: false,
    needCommercialOverlay: false,
    needSpecialDistrict: false,
  },
  {
    id: 10,
    annotations: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          'meta:mode': 'draw_annotations:linear',
          label: '29 ft',
        },
        geometry: {
          coordinates: [
            [
              -73.91311260409391,
              40.75817100752687,
            ],
            [
              -73.91314440749528,
              40.75808962172928,
            ],
          ],
          type: 'LineString',
        },
      }],
    },
    projectName: 'test',
    applicantName: 'test',
    zapProjectId: 'test',
    needDevelopmentSite: true,
    needProjectArea: true,
    needRezoning: true,
    needUnderlyingZoning: true,
    needCommercialOverlay: true,
    needSpecialDistrict: true,
    geometricPropertyIds: [1, 2],
  },
  {
    id: 9,
    projectName: 'test',
    applicantName: 'test',
    zapProjectId: 'test',
    needDevelopmentSite: true,
    needProjectArea: false,
    needRezoning: false,
    geometricPropertyIds: [1],
  },
  {
    id: 8,
    projectName: 'test',
  },
];
