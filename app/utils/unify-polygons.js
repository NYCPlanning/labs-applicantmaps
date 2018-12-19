import turfCombine from '@turf/combine';

// arg: FeatureCollection
export default function unifyPolygons(featureCollection) {
  console.log(featureCollection);
  const { geometry } = turfCombine(featureCollection)
    .features
    .find(({ geometry: { type } }) => type === 'MultiPolygon');

  return geometry;
}
