import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(project) {
    // server.createList('applicant-map', 2, { project });
    project.createApplicantMap('area-map');
    project.createApplicantMap('tax-map', {});
    project.createApplicantMap('zoning-change-map', {});
    project.createApplicantMap('zoning-section-map', {});
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
