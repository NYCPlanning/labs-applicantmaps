import turfUnion from '@turf/union';
import turfBuffer from '@turf/buffer';
// import turfDifference from '@turf/difference';

export default (combinedFC) => {
  const unionedBuffer = combinedFC.features
    .reduce((union, { geometry }) => {
      if (union === null) {
        union = geometry;
      } else {
        union = turfUnion(union, geometry);
      }

      return turfBuffer(union, -0.0005);
    }, null);

  return {
    type: 'FeatureCollection',
    features: [unionedBuffer],
  };
};
