import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  areaMaps: hasMany('area-map'),
  taxMaps: hasMany('tax-map'),
  zoningChangeMaps: hasMany('zoning-change-map'),
  zoningSectionMaps: hasMany('zoning-section-map'),
});
