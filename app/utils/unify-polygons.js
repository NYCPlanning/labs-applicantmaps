import turfCombine from '@turf/combine';

// arg: FeatureCollection
// it runs a turf combination and fines all multipolygons
export default function unifyPolygons(featureCollection) {
  const { geometry } = turfCombine(featureCollection)
    .features
    .find(({ geometry: { type } }) => type === 'MultiPolygon');

  return geometry;
}
