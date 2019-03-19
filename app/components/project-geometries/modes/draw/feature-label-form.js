import Component from '@ember/component';
import { action, observes, computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';

// it takes a selectedFeature, aliases it, and mutates properties
// based on callbacks from ember-power-select
export default class FeatureLabelFormComponent extends Component {
  // @argument
  selectedFeature;

  // @argument
  updateSelectedFeature() {}

  // @argument
  drawStateCallback() {}

  /*
   * Boolean flag computed from selectedFeature provided by calling draw/geom-type component
   * Used to optionally display the label form in "invalid" style
   * to indicate to the user that a label is required. As mode-switching is invalid w/out label,
   * user needs visual cue to know why they're stuck.
   */
  @computed('selectedFeature.features.@each.missingLabel')
  get isSelectedFeatureFormInvalid() {
    return this.get('selectedFeature.features')[0].missingLabel === true;
  }

  // @argument
  options=null;

  @argument
  canAddNewDistricts=true;

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

  // action to hide the "Add" option in power-select-with-create if current search input matches options
  @action
  hideCreateOptionIfAlreadyExists(input) {
    const options = this.get('options'); // array of district options for power-select
    // make input upper case so that still matches when user types in lower case
    const upperCaseInput = input.toUpperCase();
    // array of districts that match substring currently being typed into search box
    const searchOptions = options.filter(d => d.includes(upperCaseInput));
    // array of all elements that match between options array and searchOptions array
    const matchArray = options.filter(function(item) {
      return searchOptions.includes(item);
    });
    // canAddNewDistricts is used to exclude commercial overlays, where we do not want users to add new zoning districts
    const canAddNewDistricts = this.get('canAddNewDistricts');
    // if matchArray has no elements AND noNewDistricts is false, return true and show "Add"
    if (matchArray.length < 1 && canAddNewDistricts === true) {
      return true;
    }
    return false;
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
