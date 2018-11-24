import turfUnion from '@turf/union';

export default function unionFromFeatureCollection({ features }) {
  console.log(features);
  return turfUnion(...features);
}
