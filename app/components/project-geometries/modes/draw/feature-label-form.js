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

  @action
  handleSelectChange(newLabel) {
    const boldTextLetterSpacing = 0.2;
    const boldTextHaloColor = '#444';
    const boldTextHaloWidth = 1;
    const boldTextHaloBlur = 0;

    this.set('label', newLabel);
    this.set('textLetterSpacing', boldTextLetterSpacing);
    this.set('textHaloColor', boldTextHaloColor);
    this.set('textHaloWidth', boldTextHaloWidth);
    this.set('textHaloBlur', boldTextHaloBlur);

    // these constants are used in a match expression in underlyingZoningLabelsLayer to set different styles for new zoning districts
    const newDistrictLetterSpacing = 'newLetterSpacing';
    const newDistrictHaloColor = 'newHaloColor';
    const newDistrictHaloBlur = 'newHaloBlur';
    const newDistrictHaloWidth = 'newHaloWidth';
    this.updateSelectedFeature(newLabel, newDistrictLetterSpacing, newDistrictHaloColor, newDistrictHaloWidth, newDistrictHaloBlur);
    this.drawStateCallback();
  }
}
