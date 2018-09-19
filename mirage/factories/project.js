import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(project) {
    const commonApplicantMapAttrs = {
      center: [faker.address.latitude(), faker.address.longitude()],
    };

    project.createApplicantMap('area-map', {
      ...commonApplicantMapAttrs,
    });
    project.createApplicantMap('tax-map', {
      ...commonApplicantMapAttrs,
    });
    project.createApplicantMap('zoning-change-map', {
      ...commonApplicantMapAttrs,
    });
    project.createApplicantMap('zoning-section-map', {
      ...commonApplicantMapAttrs,
    });
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
