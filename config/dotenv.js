'use strict';

module.exports = function() {
  return {
    clientAllowedKeys: ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY'],
    // Fail build when there is missing any of clientAllowedKeys environment variables.
    // By default false.
    failOnMissingKey: false,
  };
};
