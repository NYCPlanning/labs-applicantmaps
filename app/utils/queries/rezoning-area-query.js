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
