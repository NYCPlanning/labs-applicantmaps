import { helper } from '@ember/component/helper';
import { dasherize as dasherizeString } from '@ember/string';

export function dasherize([params]) {
  return dasherizeString(params);
}

export default helper(dasherize);
