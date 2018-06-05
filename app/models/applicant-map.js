import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

const { Model } = DS;

export default class ApplicantMapModel extends Model {
  // area, tax, zoning change, zoning section
  @attr('string') type
}
