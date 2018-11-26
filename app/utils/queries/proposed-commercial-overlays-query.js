import carto from 'cartobox-promises-utility/utils/carto';
import unifyPolygons from 'labs-applicant-maps/utils/unify-polygons';
import config from '../../config/environment';

const { bufferMeters } = config;

export default (developmentSite) => {
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
      SELECT ST_Intersection(co.the_geom, buffer.the_geom) AS the_geom, overlay AS label
      FROM planninglabs.commercial_overlays_v201809 co, buffer
      WHERE ST_Intersects(co.the_geom,buffer.the_geom)
    `;

    return new carto.SQL(commercialOverlaysQuery, 'geojson');
  }

  return null;
};
