import { get } from '@ember/object';
import booleanEqual from '@turf/boolean-equal';

export default function isFeatureCollectionChanged(model, attribute) {
  // here, it gets set once by the constructor
  // const initial = model.get(attribute);
  const [
    initial,
    proposed, // upstream proposed should always be FC
  ] = model.changedAttributes()[attribute] || [];

  // console.log('if no initial and proposed');
  if (!initial && proposed) return true;

  // console.log('if no proposed, there are no changes');
  if (!proposed) return false; // no changes are proposed to canonical

  // default initial to a valid empty FC
  // since there's no canonical "initial", it considers the proposed
  // as the second.
  const initialGeoms = get(initial, 'features')
    .map((feature) => { delete feature.id; return feature; });
  const proposedGeoms = get(proposed, 'features')
    .map((feature) => { delete feature.id; return feature; });

  return (() => {
    // console.log('if the lengths differ, return true');
    if (initialGeoms.length !== proposedGeoms.length) return true;

    // console.log('check for null geoms');
    // null geoms are considered invalid and so a comparison can't be made
    if (initialGeoms.any(({ geometry }) => geometry === null)
      && initialGeoms.any(({ geometry }) => geometry === null)) {
      return false;
    }

    // console.log('check if any are unequal');
    return initialGeoms
      .any((feature, index) => !booleanEqual(feature, proposedGeoms[index]));
  })();
}
