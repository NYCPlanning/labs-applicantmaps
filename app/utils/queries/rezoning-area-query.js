import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
import turfDifference from '@turf/difference';

export default async (currentZoning, proposedZoning) => {
  // create an empty FeatureCollection to hold the difference sections
  const differenceFC = {
    type: 'FeatureCollection',
    features: [],
  };

  // flag differences
  proposedZoning.features.forEach((feature) => {
    const { id } = feature;
    const correspondingCurrentZoningFeature = currentZoning.features.filter(d => d.id === id)[0];

    // if feature exists in currentZoning, compare the geometries
    if (correspondingCurrentZoningFeature) {
      // get the difference
      const difference = turfDifference(correspondingCurrentZoningFeature, feature);
      if (difference) differenceFC.features.push(difference);

      // get the inverse difference (reverse the order of the polygons)
      const inverseDifference = turfDifference(feature, correspondingCurrentZoningFeature);
      if (inverseDifference) differenceFC.features.push(inverseDifference);
    } else {
      differenceFC.features.push(feature);
    }
  });

  // union together all difference features
  if (differenceFC.features.length > 0) {
    const differenceUnion = differenceFC.features
      .reduce((union, { geometry }) => {
        if (union === null) {
          union = geometry;
        } else {
          union = turfUnion(union, geometry);
        }

        const buffered = turfBuffer(union, -0.0005);
        return buffered;
      }, null);

    return differenceUnion;
  }

  return null;
};
