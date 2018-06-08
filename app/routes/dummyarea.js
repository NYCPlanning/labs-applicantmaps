import Route from '@ember/routing/route';
import normalizeCartoVectors from 'cartobox-promises-utility/utils/normalize-carto-vectors';
import { hash } from 'rsvp';


export default class DummyareaRoute extends Route {
  model = async function() {
    const sources = await this.store.findAll('source')
      .then(sourceModels => normalizeCartoVectors(sourceModels.toArray()));
    const layerGroups =
      await this.store.findAll('layer-group');
    const layers =
      await this.store.peekAll('layer');

    return hash({
      sources,
      layers,
      layerGroups,
    });
  }
}
