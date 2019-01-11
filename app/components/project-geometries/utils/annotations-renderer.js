import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import generateCurvature from '../../../utils/mapbox-gl-draw/annotations/generate-curvature';

export default class AnnotationsRenderer extends Component {
  @argument
  annotations;

  @argument
  map;

  @computed('annotations')
  get displayLayers() {
    const annotations = this.get('annotations');
    let displayLayers = [];

    annotations.features.forEach((feature) => {
      const { properties: { 'meta:mode': mode = '' } } = feature;
      const [, type] = mode.split(':');

      displayLayers = [...displayLayers, ...generateCurvature(feature, type)];
    });

    return displayLayers;
  }
}
