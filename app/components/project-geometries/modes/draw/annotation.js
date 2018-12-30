import DrawComponent from '../draw';

// annotation class that contains functionality specific to
// drawing and rendering annotations
export default class AnnotationMode extends DrawComponent {
  // curved line annotations have a unique requirement:
  // they should not be directly displayed, but should instead
  // be curved with an algorithm
  drawStateCallback() {
    const drawnFeatures = this.get('drawnFeatures');

    // do some stuff to drawnFeatures, like adding a type
    this.set('geometricProperty', drawnFeatures);
  }
}
