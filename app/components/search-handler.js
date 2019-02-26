import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';

const geocodedLayer = {
  type: 'circle',
  paint: {
    'circle-radius': {
      stops: [
        [
          10,
          5,
        ],
        [
          17,
          12,
        ],
      ],
    },
    'circle-color': 'rgba(199, 92, 92, 1)',
    'circle-stroke-width': {
      stops: [
        [
          10,
          20,
        ],
        [
          17,
          18,
        ],
      ],
    },
    'circle-stroke-color': 'rgba(65, 73, 255, 1)',
    'circle-opacity': 0,
    'circle-stroke-opacity': 0.2,
  },
};

export default class SearchHandlerComponent extends Component {
  @argument
  map;

  // search
  geocodedFeature = null;

  // search
  @action
  selectSearchResult({ geometry }) {
    const { coordinates } = geometry;
    const { map: { mapInstance } } = this;

    this.set('geocodedFeature', { type: 'geojson', data: geometry });
    mapInstance.flyTo({ center: coordinates, zoom: 18 });
  }

  // search
  @action
  handleSearchClear() {
    this.set('searchedAddressSource', null);
  }

  // search
  geocodedLayer = geocodedLayer;

  // search
  @action
  flyTo(center, zoom) {
    // Fly to the lot
    this.get('map.mapInstance').flyTo({ center, zoom });
    // Turn on the Tax Lots layer group
    this.set('tax-lots', true);
  }
}
