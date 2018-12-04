import calculateBbox from '@turf/bbox';
import voronoi from '@turf/voronoi';
import random from '@turf/random';
import helpers from '@turf/helpers';
import transformScale from '@turf/transform-scale';
import { faker } from 'ember-cli-mirage';
import Response from 'ember-cli-mirage/response';

const { randomPoint, randomPolygon } = random;
const { feature, featureCollection } = helpers;

export default function (schema, request) {
  const { queryParams: { q, format } = {} } = request;
  const JSONAble = q.match(/\{(.*)\}/)[0];

  // can't parse the geoJSON, but it's requesting geoJSON
  if (!JSONAble && format === 'geojson') return featureCollection();

  // it's requesting something other than GeoJSON
  if (format !== 'geojson') return { rows: [] };

  // it's JSONAble so we can compute some stuff from it
  if (JSONAble) {
    const jsonObject = JSON.parse(JSONAble);
    const queryFeatureCollection = {
      type: 'FeatureCollection',
      features: [feature(jsonObject)],
    };

    if (q.match('zoning_districts')) {
      if (schema.stableGeometries.zoning_districts) {
        return schema.stableGeometries.zoning_districts;
      }

      const bbox = calculateBbox(transformScale(queryFeatureCollection, 3));
      const randomPoints = randomPoint(50, { bbox });
      const fakeZoningDistricts = voronoi(randomPoints, { bbox });

      schema.stableGeometries.zoning_districts = fakeZoningDistricts;

      schema.stableGeometries.zoning_districts.features.forEach((zdFeature) => {
        zdFeature.properties = {
          id: faker.random.uuid(),
          label: faker.random.word(),
        };
      });

      return schema.stableGeometries.zoning_districts;
    }

    if (schema.stableGeometries.others) {
      return schema.stableGeometries.others;
    }

    const randomZoning = randomPolygon(4, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      max_radial_length: 0.005,
      num_vertices: 4,
    });

    schema.stableGeometries.others = randomZoning;

    return schema.stableGeometries.others;
  }

  return new Response(400);
}
