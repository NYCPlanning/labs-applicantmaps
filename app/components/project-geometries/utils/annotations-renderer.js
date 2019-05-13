import Component from '@ember/component';
import { computed } from '@ember/object';
import presentationLayerGenerator from '../../../utils/mapbox-gl-draw/annotations/generate-curvature';

export default class AnnotationsRenderer extends Component {
  // @argument
  annotations;

  // @argument
  map;

  @computed('annotations')
  get displayLayers() {
    const annotations = this.get('annotations');
    let displayLayers = [];

    annotations.features.forEach((feature) => {
      const { properties: { 'meta:mode': mode = '' } } = feature;
      const [, type] = mode.split(':');

      displayLayers = [...displayLayers, ...presentationLayerGenerator(feature, type)];
    });

    return displayLayers;
  }
}
