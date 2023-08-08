'use strict';

let { INTERCEPT_MAPBOX_GL = 'false', INTERCEPT_CARTO = 'false' } = process.env;

INTERCEPT_MAPBOX_GL = JSON.parse(INTERCEPT_MAPBOX_GL);
INTERCEPT_CARTO = JSON.parse(INTERCEPT_CARTO);

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'labs-applicant-maps',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    '@ember-decorators/argument': {
      ignoreComponentsWithoutValidations: true,
    },

    // reusable list of named map types
    mapTypes: ['area-maps', 'tax-maps', 'zoning-change-maps', 'zoning-section-maps'],

    // buffer in meters for queries
    bufferMeters: 500,

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    host: '',

    'ember-cli-mirage': {
      enabled: true,
    },

    interceptMapboxGL: INTERCEPT_MAPBOX_GL,
    interceptCarto: INTERCEPT_CARTO,

    'labs-search': {
      route: 'search',
      helpers: ['geosearch-v2'],
    },

    'ember-mapbox-composer': {
      host: 'https://labs-layers-api-staging.herokuapp.com',
      namespace: 'v1',
    },

    'ember-cli-notifications': {
      autoClear: true,
    },

    'mapbox-gl': {
      accessToken: '',
      map: {
        style: 'https://labs-layers-api-staging.herokuapp.com/v1/base/style.json',
        zoom: 12.25,
        center: [-73.9868, 40.724],
      },
    },

    metricsAdapters: [
      {
        name: 'GoogleAnalytics',
        environments: ['development', 'production'],
        config: {
          id: 'UA-84250233-16',
          debug: environment === 'development',
          trace: environment === 'development',
          // Ensure development env hits aren't sent to GA
          sendHitTask: (environment !== 'development' && environment !== 'devlocal'),
        },
      },
      {
        name: 'GoogleAnalyticsFour',
        environments: ['production'],
        config: {
          id: 'G-HL6ZK1ZS2K',
          options: {
            debug_mode: environment === 'development',
          },
        },
      },
    ],

    fontawesome: {
      icons: {
        'free-regular-svg-icons': 'all',
        'free-solid-svg-icons': 'all',
      },
    },
  };

  if (environment === 'development') {
    ENV['labs-search'].host = 'https://search-api-staging.herokuapp.com';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'dev-local') {
    ENV['labs-search'].host = 'https://search-api-staging.herokuapp.com';
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (environment === 'test') {
    ENV['labs-search'].host = 'https://search-api-staging.herokuapp.com';
    // Testem prefers this...
    ENV.locationType = 'none';
    ENV['ember-mapbox-composer'].host = '';
    ENV['ember-mapbox-composer'].namespace = '';

    ENV['ember-cli-mirage'] = {
      enabled: true,
    };

    ENV['ember-cli-notifications'].clearDuration = 100;

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'devlocal') {
    ENV.host = 'http://localhost:3000';
    ENV.namespace = '';

    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (environment === 'staging') {
    ENV['labs-search'].host = 'https://search-api-staging.herokuapp.com';
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
    // here you can enable a staging-specific feature
    ENV.host = 'https://applicantmaps-api-staging.herokuapp.com';
    ENV['mapbox-gl'].map.style = 'https://labs-layers-api-staging.herokuapp.com/v1/base/style.json';
  }

  if (environment === 'production') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
    // here you can enable a production-specific feature
    ENV.host = 'https://applicantmaps-api.herokuapp.com';
    ENV['mapbox-gl'].map.style = 'https://labs-layers-api.herokuapp.com/v1/base/style.json';
    ENV['ember-mapbox-composer'].host = 'https://labs-layers-api.herokuapp.com';
    ENV['labs-search'].host = 'https://search-api-production.herokuapp.com';
  }

  return ENV;
};
