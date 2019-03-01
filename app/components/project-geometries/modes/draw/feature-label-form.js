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
    this.set('label', newLabel);
    this.set('textLetterSpacing', 0.2);
    this.set('textHaloColor', '#444');
    this.set('textHaloWidth', 1);
    this.set('textHaloBlur', 0);

    // these constants are used in a match expression in underlyingZoningLabelsLayer to set different styles for new zoning districts
    const newDistrictLetterSpacing = 'newLetterSpacing';
    const newDistrictHaloColor = 'newHaloColor';
    const newDistrictHaloBlur = 'newHaloBlur';
    const newDistrictHaloWidth = 'newHaloWidth';
    this.updateSelectedFeature(newLabel, newDistrictLetterSpacing, newDistrictHaloColor, newDistrictHaloWidth, newDistrictHaloBlur);
    this.drawStateCallback();
  }
}
