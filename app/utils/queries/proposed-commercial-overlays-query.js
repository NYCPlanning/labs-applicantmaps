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
    // Get commercial overlays
    const commercialOverlaysQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${unionedGeometryFragments}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(co.the_geom, buffer.the_geom) AS the_geom, overlay AS label, cartodb_id AS id
      FROM dcp_commercial_overlays co, buffer
      WHERE ST_Intersects(co.the_geom,buffer.the_geom)
    `;

    const clippedCommercialOverlays = await new carto.SQL(commercialOverlaysQuery, 'geojson');

    return elevateGeojsonIds(clippedCommercialOverlays);
  }

  return null;
};
