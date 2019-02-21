import { Factory, faker } from 'ember-cli-mirage';
import random from 'labs-applicant-maps/tests/helpers/random-geometry';
// import random from '../../tests/helpers/random-geometry'; // this doesn't work either

const { randomPolygon } = random;

export default Factory.extend({
  proposedGeometry() {
    return randomPolygon(1, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      num_vertices: faker.random.arrayElement([4, 6, 8, 10]),
      max_radial_length: 0.003,
    });
  },
});
