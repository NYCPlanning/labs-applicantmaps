'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: ['transform-object-rest-spread'],
    },
    'ember-cli-foundation-6-sass': {
      foundationJs: 'all',
    },
    '@ember-decorators/babel-transforms': {
      decoratorsBeforeExport: false,
    },
    sourcemaps: {
      enabled: true,
      extensions: ['js'],
    },
    'ember-cli-babel': {
      includePolyfill: true,
    },
    autoImport: {
      alias: {
        'mapbox-gl': 'mapbox-gl/dist/mapbox-gl',
        '@mapbox/mapbox-gl-draw': '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw',
      },
      webpack: {
        node: {
          fs: 'empty',
        },
        module: {
          rules: [
            /* see: https://github.com/graphql/graphql-js/issues/1272#issuecomment-393903706 */
            {
              test: /\.mjs$/,
              include: /node_modules\/@turf\/difference/,
              type: 'javascript/auto',
            },
          ],
        },
      },
    },
  });

  app.import('node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
