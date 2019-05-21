import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import computeDifference from 'labs-applicant-maps/utils/compute-difference';
import { get } from '@ember/object';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

export async function combineFeatureCollections(developmentSite, allGeometricProperties) {
  const underlyingZoning = allGeometricProperties.findBy('geometryType', 'underlyingZoning') || {};
  const commercialOverlays = allGeometricProperties.findBy('geometryType', 'commercialOverlays') || {};
  const specialPurposeDistricts = allGeometricProperties.findBy('geometryType', 'specialPurposeDistricts') || {};

  const combinedFC = {
    type: 'FeatureCollection',
    features: [],
  };

  // underlyingZoning
  if (!isEmpty(get(underlyingZoning, 'proposedGeometry'))) {
    const currentZoning = get(underlyingZoning, 'canonical');

    const underlyingZoningDiff = computeDifference(currentZoning, get(underlyingZoning, 'proposedGeometry'));
    combinedFC.features = [...combinedFC.features, ...underlyingZoningDiff.features];
  }

  // commercial Overlays
  if (!isEmpty(get(commercialOverlays, 'proposedGeometry'))) {
    const currentCommercialOverlays = get(commercialOverlays, 'canonical');
    const commercialOverlaysDiff = computeDifference(currentCommercialOverlays, get(commercialOverlays, 'proposedGeometry'));

    combinedFC.features = [...combinedFC.features, ...commercialOverlaysDiff.features];
  }

  // special purpose districts
  if (!isEmpty(get(specialPurposeDistricts, 'proposedGeometry'))) {
    const currentSpecialPurposeDistricts = get(specialPurposeDistricts, 'canonical');
    const specialPurposeDistrictsDiff = computeDifference(currentSpecialPurposeDistricts, get(specialPurposeDistricts, 'proposedGeometry'));

    combinedFC.features = [...combinedFC.features, ...specialPurposeDistrictsDiff.features];
  }

  return combinedFC;
}

// returns a new GeoJSON feature if the feature is a polygon
// and if the polygon includes multiple LinearRings
// prevents "holes" from appearing the rezoning area
// see https://macwright.org/2015/03/23/geojson-second-bite#polygons
export function fillMultiPolygonHoles(feature) {
  const { geometry } = feature;
  const { type } = geometry;

  // extract the exterior of the linearRing in a polygon
  // the exterior ring is always the first in the set of coordinates:
  // - Polygon coordinates:
  //   - LinearRing (exterior)
  //     - Positions...
  //   - LinearRing (interior)
  //     - Positions...
  // splice modifies the array in-place.
  // Additionally, these are multipolygons whose coordinates
  // member is an array of Polygon coordinate arrays.
  if (type === 'MultiPolygon') {
    geometry.coordinates
      .forEach(polygonCoords => polygonCoords.splice(1, polygonCoords.length - 1));
  }

  if (type === 'Polygon') {
    geometry.coordinates.splice(1, geometry.coordinates.length - 1);
  }

  return feature;
}

export default async (...args) => {
  const combinedFC = await combineFeatureCollections(...args);

  const unionedGeoms = combinedFC.features
    .reduce((union, { geometry }) => {
      if (union === null) {
        union = geometry;
      } else {
        union = turfUnion(union, geometry);
      }

      // negative buffer removes slivers & artifacts of drawing
      return turfBuffer(union, -0.0005);
    }, null);

  // this is always one feature
  let bufferedUnionedGeoms = [];
  try {
    const buffered = turfBuffer(unionedGeoms, 0.006);
    const filled = fillMultiPolygonHoles(buffered);

    bufferedUnionedGeoms = [filled];
  } catch (e) {
    console.log(e);
  }

  return {
    type: 'FeatureCollection',
    features: bufferedUnionedGeoms,
  };
};
