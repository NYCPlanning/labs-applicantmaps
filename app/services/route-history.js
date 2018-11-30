import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';

export default ArrayProxy.extend({
  content: A([]),
});
