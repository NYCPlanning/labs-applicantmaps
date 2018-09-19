import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  applicantMaps: hasMany({ polymorphic: true }),
});
