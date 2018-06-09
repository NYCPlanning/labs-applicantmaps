import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { hash } from 'rsvp';
import normalizeCartoVectors from 'cartobox-promises-utility/utils/normalize-carto-vectors';
import turfBbox from 'npm:@turf/bbox';

export default class AreaMapFormComponent extends Component {
  constructor() {
    super(...arguments);

    const store = this.get('store');

    const sources = store.findAll('source')
      .then(sourceModels => normalizeCartoVectors(sourceModels.toArray()));
    const layerGroups = store.findAll('layer-group');
    const layers = store.peekAll('layer');

    hash({
      sources,
      layers,
      layerGroups })
    .then(modelHash => {
      this.set('layerModels', modelHash);
    });
  }

  @service store;

  layerModels = null;

  transformRequest(url) {
    window.XMLHttpRequest = window.XMLHttpRequestNative;
    return { url };
  }

  // TODO for some reason I have to pass in the projectArea instead
  // of just calling this.get('projectAreaSource') ('this' is not available in the action)
  @action
  handleMapLoad(projectArea, map) {
    window.map = map;

    map.fitBounds(turfBbox.default(projectArea), {
      padding: 100,
    });

  }
}
