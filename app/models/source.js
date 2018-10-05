import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

const { Model } = DS;

export default class extends Model {
  @attr() meta;
}
