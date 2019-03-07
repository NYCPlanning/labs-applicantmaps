import Component from '@ember/component';
import { action, observes } from '@ember-decorators/object';
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

  isBold = false;

  isLarge = false;

  @observes('selectedFeature')
  selectedFeatureUpdated() {
    this.set('isBold', false);
    this.set('isLarge', false);
  }

  @alias('selectedFeature.features.firstObject.properties.label')
  label;

  @alias('selectedFeature.features.firstObject.geometry.type')
  geomType;

  @action
  handleSelectChange(newLabel) {
    this.set('label', newLabel);
    this.updateSelectedFeature('label', newLabel);
    if (this.get('geomType') === 'Polygon') {
      this.updateSelectedFeature('textFont', 'bold');
    }
    this.drawStateCallback();
  }

  @action
  toggleSize() {
    const shouldMakeSmall = this.get('isLarge');

    const textSize = shouldMakeSmall ? 'default' : 'large';
    this.updateSelectedFeature('textSize', textSize);

    this.set('isLarge', !shouldMakeSmall);
  }

  @action
  toggleWeight() {
    const shouldMakeLight = this.get('isBold');


    const textFont = shouldMakeLight ? 'default' : 'bold';
    this.updateSelectedFeature('textFont', textFont);

    this.set('isBold', !shouldMakeLight);
  }
}
