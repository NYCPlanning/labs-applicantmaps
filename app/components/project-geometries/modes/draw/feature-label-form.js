import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { alias } from '@ember-decorators/object/computed';

export default class FeatureLabelFormComponent extends Component {
  @argument
  selectedFeature;

  @argument
  updateSelectedFeature() {}

  @alias('selectedFeature.features.firstObject.properties.label')
  label;
}
