import turfDifference from '@turf/difference';

export default function computeDifference(current, proposed) {
  if (!proposed) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
  // create an empty FeatureCollection to hold the difference sections
  const differenceFC = {
    type: 'FeatureCollection',
    features: [],
  };

  // flag differences
  proposed.features.forEach((feature) => {
    const { id } = feature;
    const correspondingCurrentFeature = current.features.filter(d => d.id === id)[0];

    // if feature exists in currentZoning, compare the geometries
    if (correspondingCurrentFeature) {
      // get the difference
      const difference = turfDifference(correspondingCurrentFeature, feature);
      if (difference) differenceFC.features.push(difference);

      // get the inverse difference (reverse the order of the polygons)
      const inverseDifference = turfDifference(feature, correspondingCurrentFeature);
      if (inverseDifference) differenceFC.features.push(inverseDifference);
    } else {
      differenceFC.features.push(feature);
    }
  });

  return differenceFC;
}
