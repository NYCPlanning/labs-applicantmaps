import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, observes } from '@ember-decorators/object';
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

  @observes('boundsPolygon')
  resize() {
    const map = this.get('mapInstance');
    // just incase this gets triggered unexpectedly before the map has been loaded,
    // only attempt to re-render if map exists
    if (map) {
      this.resizeMap(map);
    }
  }

  // wrapped for test-ability
  resizeMap = function(map) {
    map.resize();
  }
}
