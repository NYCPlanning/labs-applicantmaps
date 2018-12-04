import random from '@turf/random';
import calculateBbox from '@turf/bbox';
import voronoi from '@turf/voronoi';
import helpers from '@turf/helpers';
import transformScale from '@turf/transform-scale';
import patchXMLHTTPRequest from './helpers/mirage-mapbox-gl-monkeypatch';

const { randomPoint, randomPolygon } = random;
const { feature } = helpers;

export default function() {
  patchXMLHTTPRequest();

  // generate geojson from memory for testing
  this.get('https://planninglabs.carto.com/api/v2/sql', (schema, request) => {
    const { queryParams: { q } = {} } = request;
    const JSONAble = q.match(/\{(.*)\}/)[0];

    if (JSONAble) {
      const jsonObject = JSON.parse(JSONAble);
      const featureCollection = { type: 'FeatureCollection', features: [feature(jsonObject)] };

      if (q.match('zoning_districts')) {
        const bbox = calculateBbox(transformScale(featureCollection, 3));
        const randomPoints = randomPoint(50, { bbox });
        return voronoi(randomPoints, { bbox });
      }
    }

    return randomPolygon(4, {
      // Manhattan bbox
      bbox: [-73.97286695932547, 40.7674887779298, -73.99673516858115, 40.74578266557765],
      max_radial_length: 0.005,
      num_vertices: 4,
    });
  });

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
  this.passthrough('/write-coverage');
  this.passthrough('/sources.json');
  this.passthrough('/layer-groups.json');

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
