import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(project, server) {
    server.createList('applicant-map', 2, { project });
  },

  projectName() {
    return `${faker.company.companyName()}`;
  },

  applicantName() {
    return `${faker.name.firstName()} ${faker.name.lastName()}`;
  },

  projectId() {
    return faker.random.alphaNumeric();
  },

  datePrepared() {
    return faker.date.past();
  },
});
