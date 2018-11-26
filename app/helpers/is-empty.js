import { helper } from '@ember/component/helper';
import isEmpty from '../utils/is-empty';

export default helper(([value]) => isEmpty(value));
