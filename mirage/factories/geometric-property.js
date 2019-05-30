import { Factory, faker, trait } from 'ember-cli-mirage';
import random from '../helpers/random-geometry';

const { randomPolygon } = random;
const annotations = {
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
};

export default Factory.extend({
  proposedGeometry() {
    return randomPolygon(1, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      num_vertices: faker.random.arrayElement([4, 6, 8, 10]),
      max_radial_length: 0.003,
    });
  },

  hasAnnotations: trait({
    annotations,
  }),
});
