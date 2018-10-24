/* eslint-disable */

'use strict';

self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "log", matchId: "ember-meta.descriptor-on-object" },
    { handler: "log", matchId: "ember-runtime.deprecate-copy-copyable" }
  ]
};
