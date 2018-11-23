// an empty FeatureCollection should be considered falsey
export default function isEmpty(property) {
  const isNativelyFalsey = !!property === false;
  const isHash = (typeof property) === 'object' && property !== null;

  if (isHash) {
    const isFeatureCollection = Object.keys(property).includes('type')
      && Object.keys(property).includes('features');

    if (isFeatureCollection) {
      // check that every geometry is falsey
      return property.features
        .map(({ geometry }) => geometry)
        .every(geom => !!geom === false);
    }
  }

  return isNativelyFalsey;
}
