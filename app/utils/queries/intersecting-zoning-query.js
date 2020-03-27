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
    // Get zoning districts
    const zoningQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${unionedGeometryFragments}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(zoning.the_geom, buffer.the_geom) AS the_geom, zonedist AS label, cartodb_id AS id
      FROM planninglabs.zoning_districts zoning, buffer
      WHERE ST_Intersects(zoning.the_geom,buffer.the_geom)
    `;

    const clippedZoningDistricts = await new carto.SQL(zoningQuery, 'geojson');

    return elevateGeojsonIds(clippedZoningDistricts);
  }

  return null;
};
