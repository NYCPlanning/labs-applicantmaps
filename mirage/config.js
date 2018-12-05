import Response from 'ember-cli-mirage/response';
import patchXMLHTTPRequest from './helpers/mirage-mapbox-gl-monkeypatch';
import handleCartoGeometries from './helpers/handle-fake-carto-geometries';
import config from '../config/environment';
import {
  layersAPIStyle,
  v3JSON,
  baseStyle,
  spritesJson,
} from './helpers/static-styles';

const { interceptCarto } = config;

export default function() {
  patchXMLHTTPRequest();

  this.schema.stableGeometries = {
    zoning_districts: null,
    commercial_overlays: null,
    special_purpose_districts: null,
  };

  if (interceptCarto) {
    console.log('intercepting...');
    // generate geojson from memory for testing
    this.get('https://planninglabs.carto.com/api/v2/sql', handleCartoGeometries);
    this.post('/layer-groups', function(schema) {
      const response = schema.layerGroups.all();
      const json = this.serialize(response);

      json.meta = {
        mapboxStyle: layersAPIStyle,
      };

      return json;
    });

    // note:
    // this is a workaround to get arraybuffers sent to mapbox-gl
    // see mirage-mapbox-gl-monkeypatch
    this.get('https://tiles.planninglabs.nyc/fonts/**', () => {});
    this.get('https://layers-api-staging.planninglabs.nyc/static/v3.json', () => new Response(200, {
      'Content-Type': 'application/json',
    }, v3JSON));
    this.get('https://layers-api-staging.planninglabs.nyc/v1/base/style.json', () => baseStyle);
    this.get('https://layers-api-staging.planninglabs.nyc/static/sprite@2x.json', () => spritesJson);
    this.get('https://layers-api-staging.planninglabs.nyc/static/sprite@2x.png', () => {});
    this.get('https://tiles.planninglabs.nyc/data/v3/**', () => {});
  } else {
    // intercept and generate geojson from server
    this.passthrough('https://planninglabs.carto.com/**');
    this.passthrough('https://search-api.planninglabs.nyc/**');
    this.passthrough('https://layers-api.planninglabs.nyc/**');
    this.passthrough('https://raw.githubusercontent.com/**');
    this.passthrough('http://raw.githubusercontent.com/**');
    this.passthrough('https://raw.githubusercontent.com/**');
    this.passthrough('https://tiles.planninglabs.nyc/**');
    this.passthrough('https://layers-api-staging.planninglabs.nyc/**');
    this.passthrough('http://localhost:3000/**');
  }

  this.passthrough('/write-coverage');

  // REST Endpoints
  this.get('/projects');
  this.get('/projects/:id');
  this.patch('/projects/:id');
  this.post('/projects');
  this.post('/area-maps');
  this.patch('/area-maps/:id');
  this.post('/tax-maps');
  this.patch('/tax-maps/:id');
  this.post('/zoning-change-maps');
  this.patch('/zoning-change-maps/:id');
  this.post('/zoning-section-maps');
  this.patch('/zoning-section-maps/:id');

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */
}
