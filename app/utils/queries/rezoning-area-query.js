import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';

export default (combinedFC) => {
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

  // buffer the geoms by ~20 feet
  const bufferedUnionedGeoms = turfBuffer(unionedGeoms, 0.006);

  return {
    type: 'FeatureCollection',
    features: [bufferedUnionedGeoms],
  };
};
