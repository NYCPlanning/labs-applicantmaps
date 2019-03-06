import { helper } from '@ember/component/helper';
import { projectProcedure } from 'labs-applicant-maps/models/project';

// takes a "routing" simple object (requires `route` key),
// and looks up first occurring step (defined in model)
// with that routing information
// a "reverse lookup" of step from routing information
// alloways an optional offset
export function findRelativeStep([routing, offset = 0]) {
  const {
    route, // required - should be dot-notation style route path
    type, // optional qp
  } = routing;

  const foundIndex = projectProcedure.findIndex(({ routing: currRouting }) => (
    currRouting.route === route
      && currRouting.type === type));

  return projectProcedure[foundIndex + offset];
}

export default helper(findRelativeStep);
