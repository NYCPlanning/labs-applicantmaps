import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';


const { Model } = DS;

export default class ProjectModel extends Model {
  @hasMany('applicant-map', { polymorphic: true }) applicantMaps;



  @attr() projectArea; // geojson
  @attr('string') projectName;
  @attr('string') applicantName;
  @attr('string') projectId;
  @attr('number', { defaultValue: 0 }) datePrepared;

  @computed('projectName', 'applicantName', 'projectArea')
  get isValid() {
    const projectName = this.get('projectName');
    const applicantName = this.get('applicantName');
    const projectArea = this.get('projectArea');

    return !!projectName && !!applicantName && !!projectArea;
  }
}
