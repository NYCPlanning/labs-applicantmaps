import carto from 'cartobox-promises-utility/utils/carto';
import unifyPolygons from 'labs-applicant-maps/utils/unify-polygons';
import elevateGeojsonIds from 'labs-applicant-maps/utils/elevate-geojson-ids';
import config from '../../config/environment';

const { bufferMeters } = config;

export default async (developmentSite) => {
  const unionedGeometryFragments = JSON
    .stringify(
      unifyPolygons(developmentSite),
    );

  if (developmentSite) {
    // Get special purpose districts
    const specialPurposeDistrictsQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${unionedGeometryFragments}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(spd.the_geom, buffer.the_geom) AS the_geom, sdname AS label, cartodb_id AS id
      FROM planninglabs.special_purpose_districts_v201809 spd, buffer
      WHERE ST_Intersects(spd.the_geom,buffer.the_geom)
    `;

    const clippedSpecialPurposeDistricts = await new carto.SQL(specialPurposeDistrictsQuery, 'geojson');

    return elevateGeojsonIds(clippedSpecialPurposeDistricts);
  }

  return null;
};
