import { helper } from '@ember/component/helper';
import { camelize as camelizeString } from '@ember/string';

export function camelize([string]) {
  return camelizeString(string);
}

export default helper(camelize);
