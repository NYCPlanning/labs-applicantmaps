'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'labs-applicant-maps',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
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

    'labs-search': {
      host: 'https://search-api.planninglabs.nyc',
      route: 'search',
      helpers: ['geosearch'],
    },

    'ember-mapbox-composer': {
      host: 'https://layers-api-staging.planninglabs.nyc',
      namespace: 'v1',
    },

    'ember-cli-notifications': {
      autoClear: true,
    },

    'mapbox-gl': {
      accessToken: '',
      map: {
        style: 'https://layers-api-staging.planninglabs.nyc/v1/base/style.json',
        zoom: 12.25,
        center: [-73.9868, 40.724],
      },
    },

    fontawesome: {
      icons: {
        'free-regular-svg-icons': 'all',
        'free-solid-svg-icons': 'all',
      },
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'dev-local') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

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
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
    // here you can enable a staging-specific feature
    ENV.host = 'https://applicantmaps-api-staging.planninglabs.nyc';
    ENV['mapbox-gl'].map.style = 'https://layers-api-staging.planninglabs.nyc/v1/base/style.json';
  }

  if (environment === 'production') {
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
    // here you can enable a production-specific feature
    ENV.host = 'https://applicantmaps-api.planninglabs.nyc';
    ENV['mapbox-gl'].map.style = 'https://layers-api.planninglabs.nyc/v1/base/style.json';
  }

  return ENV;
};
