import turfUnion from '@turf/union';

export default function unionFromFeatureCollection({ features }) {
  return turfUnion(...features);
}
