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

  @alias('selectedFeature.features.firstObject.properties.textFont')
  textFont;

  // whatever district you choose in the power select is what goes in bigGuy
  @action
  handleSelectChange(newLabel) {
    this.set('label', newLabel); // this is saving it to memory (console)
    // const textBold = ''
    const newText = ['Open Sans Bold'];
    this.set('textFont', newText); // adds a property textCOLOR to bigGuy WORKING
    this.updateSelectedFeature(newLabel, newText); // this is what changes it on the map
    const bigGuy = this.get('selectedFeature.features.firstObject.properties');
    console.log('bigGuy', bigGuy);
    this.drawStateCallback();
  }
}
