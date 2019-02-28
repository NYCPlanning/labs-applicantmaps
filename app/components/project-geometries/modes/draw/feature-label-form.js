import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { alias } from '@ember-decorators/object/computed';

// it takes a selectedFeature, aliases it, and mutates properties
// based on callbacks from ember-power-select
export default class FeatureLabelFormComponent extends Component {
  @argument
  selectedFeature;

  @argument
  updateSelectedFeature() {}

  @argument
  drawStateCallback() {}

  @argument
  options=null;

  @alias('selectedFeature.features.firstObject.properties.label')
  label;

  @alias('selectedFeature.features.firstObject.properties.textLetterSpacing')
  textLetterSpacing;

  @alias('selectedFeature.features.firstObject.properties.textHaloColor')
  textHaloColor;

  @alias('selectedFeature.features.firstObject.properties.textHaloWidth')
  textHaloWidth;

  @alias('selectedFeature.features.firstObject.properties.textHaloBlur')
  textHaloBlur;

  // whatever district you choose in the power select is what goes in bigGuy
  @action
  handleSelectChange(newLabel) {
    this.set('label', newLabel); // this is saving it to memory (console)
    this.set('textLetterSpacing', 0.2);
    this.set('textHaloColor', '#444');
    this.set('textHaloWidth', 1);
    this.set('textHaloBlur', 0);
    const newHaloColor = '#444';
    this.updateSelectedFeature(newLabel, 1, newHaloColor, 1, 0); // this is what changes it on the map
    const bigGuy = this.get('selectedFeature.features.firstObject.properties');
    console.log('bigGuy', bigGuy);
    this.drawStateCallback();
  }
}
