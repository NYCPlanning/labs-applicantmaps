import carto from 'cartobox-promises-utility/utils/carto';
import unifyPolygons from 'labs-applicant-maps/utils/unify-polygons';

const bufferMeters = 500;

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
      FROM planninglabs.zoning_districts_v201809 zoning, buffer
      WHERE ST_Intersects(zoning.the_geom,buffer.the_geom)
    `;

    const clippedZoningDistricts = await new carto.SQL(zoningQuery, 'geojson');

    // add an id to the top level of each feature object, for use by mapbox-gl-draw
    const { features } = clippedZoningDistricts;
    clippedZoningDistricts.features = features.map((feature) => {
      feature.id = feature.properties.id;
      return feature;
    });

    return clippedZoningDistricts;
  }

  return null;
};
