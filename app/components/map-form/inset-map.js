import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { classNames } from '@ember-decorators/component';
import turfBbox from '@turf/bbox';
import turfBuffer from '@turf/buffer';


export default
@classNames('inset-map-container')
class InsetMap extends Component {
  @argument
  boundsPolygon

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    const bounds = this.get('boundsPolygon');

    map.fitBounds(turfBbox(turfBuffer(bounds, 13)), {
      duration: 0,
    });
  }
}
