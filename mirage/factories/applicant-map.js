import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  project: association(),
});
