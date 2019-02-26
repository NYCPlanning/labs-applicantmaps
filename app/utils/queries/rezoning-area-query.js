import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import computeDifference from 'labs-applicant-maps/utils/compute-difference';
import isEmpty from 'labs-applicant-maps/utils/is-empty';

/* 
 * Generates a feature collection that includes the full diff of all proposed geometries vs canonical.
 *
 * Parameters:
 *  developmentSite: UNUSED (TODO: remove)
 *  allGeometricProperties: Object containing geometricProperty objects, keyed by type
 *  ( see: app/models/geometric-property)
 * 
 * Returns: FeatureCollection
 */
export async function combineFeatureCollections(developmentSite, allGeometricProperties) {
  const underlyingZoning = allGeometricProperties.findBy('geometryType', 'underlyingZoning');
  const commercialOverlays = allGeometricProperties.findBy('geometryType', 'commercialOverlays');
  const specialPurposeDistricts = allGeometricProperties.findBy('geometryType', 'specialPurposeDistricts');

  const combinedFC = {
    type: 'FeatureCollection',
    features: [],
  }; 

  // underlyingZoning 
  if (!isEmpty(underlyingZoning.get('proposedGeometry'))) {
    const currentZoning = underlyingZoning.get('canonical');
    const underlyingZoningDiff = computeDifference(currentZoning, underlyingZoning.get('proposedGeometry'));
    combinedFC.features = [...combinedFC.features, ...underlyingZoningDiff.features];
  }

  // commercial Overlays
  if (!isEmpty(commercialOverlays.get('proposedGeometry'))) {
    const currentCommercialOverlays = commercialOverlays.get('canonical');
    const commercialOverlaysDiff = computeDifference(currentCommercialOverlays, commercialOverlays.get('proposedGeometry'));

    combinedFC.features = [...combinedFC.features, ...commercialOverlaysDiff.features];
  }

  // special purpose districts
  if (!isEmpty(specialPurposeDistricts.get('proposedGeometry'))) {
    const currentSpecialPurposeDistricts = specialPurposeDistricts.get('canonical');
    const specialPurposeDistrictsDiff = computeDifference(currentSpecialPurposeDistricts, specialPurposeDistricts.get('proposedGeometry'));

    combinedFC.features = [...combinedFC.features, ...specialPurposeDistrictsDiff.features];
  }

  return combinedFC;
}

/*
 * Creates a "rezoning area" geometry by getting FC of combined diffs of all proposed geometries,
 * unioning it with turfUnion, cleaning it with turfBuffer by applying slight negative buffer, 
 * and finally buffering the final unioned, cleaned geometries by ~20ft 
 * 
 * Returns: FeatureCollection
 */
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

  let bufferedUnionedGeoms = [];
  try {
    // buffer the geoms by ~20 feet
    bufferedUnionedGeoms = [turfBuffer(unionedGeoms, 0.006)];
  } catch (e) {
    console.log(e);
  }

  return {
    type: 'FeatureCollection',
    features: bufferedUnionedGeoms,
  };
};
