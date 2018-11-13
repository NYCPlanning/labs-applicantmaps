import { helper } from '@ember/component/helper';

export function noop(params/*, hash*/) {
  return params;
}

export default helper(noop);
