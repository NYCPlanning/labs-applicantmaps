import DS from 'ember-data';

const { Model, attr } = DS;

export default class Source extends Model {
  @attr() meta;
}
