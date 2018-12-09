import calculateBbox from '@turf/bbox';
import voronoi from '@turf/voronoi';
import random from '@turf/random';
import helpers from '@turf/helpers';
import transformScale from '@turf/transform-scale';
import { faker } from 'ember-cli-mirage';
import Response from 'ember-cli-mirage/response';

const { randomPoint, randomPolygon } = random;
const { feature } = helpers;

export default function (schema, request) {
  const { queryParams: { q, format } = {} } = request;

  const JSONAble = (q.match(/\{(.*)\}/) || [])[0];

  // can't parse the geoJSON, but it's requesting geoJSON
  if (!JSONAble && format === 'geojson') return randomPolygon(5);

  // it's requesting something other than GeoJSON
  if (format !== 'geojson') return { rows: [] };

  // it's JSONAble so we can compute some stuff from it
  if (JSONAble) {
    const jsonObject = JSON.parse(JSONAble);
    const queryFeatureCollection = {
      type: 'FeatureCollection',
      features: [feature(jsonObject)],
    };

    const bbox = calculateBbox(transformScale(queryFeatureCollection, 3));
    const randomPoints = randomPoint(50, { bbox });
    const randomZoning = randomPolygon(4, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      max_radial_length: 0.005,
      num_vertices: 4,
    });
    const fakeZoningDistricts = voronoi(randomPoints, { bbox });

    if (q.match('planninglabs.zoning_districts')) {
      if (schema.stableGeometries.zoning_districts) {
        return schema.stableGeometries.zoning_districts;
      }

      schema.stableGeometries.zoning_districts = fakeZoningDistricts;

      schema.stableGeometries.zoning_districts.features.forEach((zoningDistrict) => {
        zoningDistrict.properties = {
          id: faker.random.uuid(),
          label: faker.random.word(),
        };
      });

      return schema.stableGeometries.zoning_districts;
    }

    if (q.match('planninglabs.special_purpose_districts')) {
      if (schema.stableGeometries.special_purpose_districts) {
        return schema.stableGeometries.special_purpose_districts;
      }

      schema.stableGeometries.special_purpose_districts = randomZoning;

      schema.stableGeometries.special_purpose_districts.features.forEach((specialPurposeDistrict) => {
        specialPurposeDistrict.properties = {
          id: faker.random.uuid(),
          label: faker.random.word(),
        };
      });

      return schema.stableGeometries.special_purpose_districts;
    }

    if (q.match('planninglabs.commercial_overlays')) {
      if (schema.stableGeometries.commercial_overlays) {
        return schema.stableGeometries.commercial_overlays;
      }

      schema.stableGeometries.commercial_overlays = randomZoning;

      schema.stableGeometries.commercial_overlays.features.forEach((commercialOverlay) => {
        commercialOverlay.properties = {
          id: faker.random.uuid(),
          label: faker.random.word(),
        };
      });

      return schema.stableGeometries.commercial_overlays;
    }
  }

  return new Response(400);
}
