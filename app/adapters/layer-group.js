import DS from 'ember-data';
import config from '../config/environment';

const { 'ember-mapbox-composer': { host, namespace } } = config;
const { JSONAPIAdapter } = DS;

export default class LayerGroupAdapter extends JSONAPIAdapter {
  host = host;

  namespace = namespace;

  async query(store, type, query = {}) {
    const URL = this.buildURL(type.modelName);

    return fetch(`${URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(query),
    }).then(blob => blob.json());
  }
}
