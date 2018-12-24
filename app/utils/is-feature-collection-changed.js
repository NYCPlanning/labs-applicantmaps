import { get } from '@ember/object';
import booleanEqual from '@turf/boolean-equal';

export default function isFeatureCollectionChanged(initial, proposed) {
  const initialGeoms = get(initial, 'features')
    .map((feature) => { delete feature.id; return feature; });

  const proposedGeoms = get(proposed, 'features')
    .map((feature) => { delete feature.id; return feature; });

  // sort according to property id. difference judgment is order-sensitive
  // because it is compare features by index
  [initialGeoms, proposedGeoms]
    .forEach((features) => {
      features.sort((feature1, feature2) => {
        const { properties: { id } } = feature2;
        const { properties: { id: compareId } } = feature1;

        return id - compareId;
      });
    });

  return (() => {
    // console.log('if the lengths differ, return true');
    if (initialGeoms.length !== proposedGeoms.length) return true;

    // console.log('check for null geoms');
    // null geoms are considered invalid and so a comparison can't be made
    if (initialGeoms.every(({ geometry }) => geometry === null)
      && proposedGeoms.every(({ geometry }) => geometry === null)) {
      return false;
    }

    // console.log('check if any are unequal');
    return initialGeoms
      .any((feature, index) => !booleanEqual(feature, proposedGeoms[index]));
  })();
}
