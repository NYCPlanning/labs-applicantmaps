import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import turfBbox from 'npm:@turf/bbox';
import turfBuffer from 'npm:@turf/buffer';


export default
@classNames('inset-map-container')
class InsetMap extends Component {
  @argument
  boundsPolygon

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    const bounds = this.get('boundsPolygon');

    map.fitBounds(turfBbox.default(turfBuffer.default(bounds, 12)), {
      duration: 0,
    });
  }
}
