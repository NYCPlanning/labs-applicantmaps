import { Factory, faker, trait } from 'ember-cli-mirage';

export default Factory.extend({
  hasDevelopmentSite: trait({
    needDevelopmentSite: true,
    afterCreate(project, server) {
      server.create('geometric-property', {
        project,
        geometryType: 'developmentSite',
      });
    },
  }),

  hasProjectArea: trait({
    needProjectArea: true,
    afterCreate(project, server) {
      server.create('geometric-property', {
        project,
        geometryType: 'projectArea',
      });
    },
  }),

  projectName() {
    return 'Mullberry Crossing';
  },

  applicantName() {
    return 'CMW Properties, LLC';
  },

  zapProjectId() {
    return faker.random.uuid();
  },

  datePrepared() {
    return faker.date.past();
  },

  needProjectArea() {
    return faker.random.boolean();
  },

  needRezoning() {
    // return faker.random.boolean();
    return false;
  },

  needUnderlyingZoning() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needCommercialOverlay() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needSpecialDistrict() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },
});
