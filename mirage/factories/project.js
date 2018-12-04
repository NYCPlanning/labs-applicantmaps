import { Factory, faker } from 'ember-cli-mirage';
import random from '@turf/random';
import calculateBbox from '@turf/bbox';
import bboxToPolygon from '@turf/bbox-polygon';

const { randomPolygon } = random;

// attempt to compute random zoning, probably
// best if we did a voronoi map instead

// function computeRandomPolygonsFor(featureCollection) {
//   const projectBbox = calculateBbox(featureCollection)
//     // .map((coord, index) => ((coord > 0) ? (coord + 0.01) : (coord - 0.01)));
//     .map((coord, index) => {
//       if (index < 2) {
//         return coord - 0.01;
//       }

//       return coord + 0.01;
//     });

//   return randomPolygon(15, {
//     bbox: projectBbox,
//     num_vertices: 5,
//     max_radial_length: 0.005,
//   });
// }

export default Factory.extend({
  afterCreate(project, server) {
    server.createList('area-map', 0, { project });
    server.createList('tax-map', 0, { project });
    server.createList('zoning-change-map', 1, { project });
    server.createList('zoning-section-map', 1, { project });
  },

  projectName() {
    return 'Mullberry Crossing';
  },

  applicantName() {
    return 'CMW Properties, LLC';
  },

  zapProjectId() {
    return faker.random.uuid();
  },

  datePrepared() {
    return faker.date.past();
  },

  needProjectArea() {
    return faker.random.boolean();
  },

  needRezoning() {
    return faker.random.boolean();
  },

  needUnderlyingZoning() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needCommercialOverlay() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needSpecialDistrict() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  developmentSite() {
    return randomPolygon(1, {
      // Manhattan bbox
      bbox: [-73.97286695932547, 40.7674887779298, -73.99673516858115, 40.74578266557765],
      num_vertices: faker.random.arrayElement([4, 6, 8, 10]),
      max_radial_length: 0.005,
    });
  },

  projectArea() {
    const projectArea = bboxToPolygon(calculateBbox(this.developmentSite));

    return { type: 'FeatureCollection', features: [projectArea] };
  },
});
