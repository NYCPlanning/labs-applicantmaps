import turfDifference from '@turf/difference';

const getDifferenceFeature = (featureA, featureB) => {
  // get the difference
  const differenceFeature = turfDifference(featureA, featureB);

  if (differenceFeature) return differenceFeature;
  return null;
};

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
      const differenceFeature = getDifferenceFeature(correspondingCurrentFeature, feature);
      if (differenceFeature) differenceFC.features.push(differenceFeature);

      const inverseDifferenceFeature = getDifferenceFeature(feature, correspondingCurrentFeature);
      if (inverseDifferenceFeature) differenceFC.features.push(inverseDifferenceFeature);

      // if the feature's label is different, push the whole feature as a difference fragment
      const { label } = feature.properties;
      const correspondingLabel = correspondingCurrentFeature.properties.label;
      const labelDifferent = label !== correspondingLabel;

      if (labelDifferent) differenceFC.features.push(feature);
    } else {
      differenceFC.features.push(feature);
    }
  });

  return differenceFC;
}
