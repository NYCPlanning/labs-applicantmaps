import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(project, server) {
    const maps = server.createList('applicant-map', 10, { project });
    project.maps = maps;
  },

  projectName() {
    return `${faker.company.companyName()}`;
  },

  applicantName() {
    return `${faker.name.firstName()} ${faker.name.lastName()}`;
  },

  projectID() {
    return faker.random.alphaNumeric();
  },

  datePrepared() {
    return faker.date.past();
  },
});
