import { action } from '@ember-decorators/object';
import DrawComponent from '../draw';

// annotation class that contains functionality specific to
// drawing and rendering annotations
export default class AnnotationMode extends DrawComponent {
  target = 'draw/annotation';

  @action
  handleStraightLine() {
    const { draw: { drawInstance: draw } } = this.get('map');

    draw.changeMode('draw_line_string');
  }
}
