import { helper } from '@ember/component/helper';

export function includes([haystack, needle]) {
  return haystack.includes(needle);
}

export default helper(includes);
