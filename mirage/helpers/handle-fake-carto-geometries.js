import calculateBbox from '@turf/bbox';
import voronoi from '@turf/voronoi';
import random from '@turf/random';
import helpers from '@turf/helpers';
import transformScale from '@turf/transform-scale';
import truncate from '@turf/truncate';
import { faker } from 'ember-cli-mirage';

const { randomPoint, randomPolygon } = random;
const { feature } = helpers;

export default function (schema, request) {
  const { queryParams: { q } = {} } = request;
  const JSONAble = q.match(/\{(.*)\}/)[0];

  const computedFeatureCollection = (() => {
    if (JSONAble) {
      const jsonObject = JSON.parse(JSONAble);
      const featureCollection = {
        type: 'FeatureCollection',
        features: [feature(jsonObject)],
      };

      if (q.match('zoning_districts')) {
        const bbox = calculateBbox(transformScale(featureCollection, 3));
        const randomPoints = randomPoint(3, { bbox });
        const fakeZoningDistricts = voronoi(randomPoints, { bbox });

        if (schema.stableGeometries.zoning_districts) {
          return schema.stableGeometries.zoning_districts;
        }

        schema.stableGeometries.zoning_districts = fakeZoningDistricts;

        return schema.stableGeometries.zoning_districts;
      }
    }

    const randomZoning = randomPolygon(4, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      max_radial_length: 0.005,
      num_vertices: 4,
    });

    if (schema.stableGeometries.others) {
      return schema.stableGeometries.others;
    }

    schema.stableGeometries.others = randomZoning;

    return schema.stableGeometries.others;
  })();

  return {
    type: 'FeatureCollection',
    features: truncate(computedFeatureCollection, { precision: 6 }).features
      .map((computedFeature) => {
        computedFeature.properties.id = faker.random.uuid(); return computedFeature;
      }),
  };
}
