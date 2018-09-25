import DS from 'ember-data';
import { belongsTo } from '@ember-decorators/data';

const { Model } = DS;

export default class AreaMapModel extends Model {
  @belongsTo('project') project;
}
