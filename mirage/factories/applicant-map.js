import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  paperOrientation() {
    return faker.random.arrayElement(['landscape', 'portrait']);
  },
  paperSize() {
    return faker.random.arrayElement(['tabloid', 'letter']);
  },
  mapBearing() {
    return faker.random.number(-180, 180);
  },
  boundsPolygon() {
    return {
      type: 'Polygon',
      coordinates: [
        [
          [
            -73.99976877714354,
            40.720674259759846,
          ],
          [
            -73.99479354511911,
            40.720674259759846,
          ],
          [
            -73.99479354511911,
            40.717534531206525,
          ],
          [
            -73.99976877714354,
            40.717534531206525,
          ],
          [
            -73.99976877714354,
            40.720674259759846,
          ],
        ],
      ],
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326',
        },
      },
    };
  },
});
