import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  mapName() {
    return `${faker.company.companyName()}`;
  },

  center() {
    return [faker.address.longitude(), faker.address.latitude()];
  },
});
