/* eslint-disable */

'use strict';

self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "ember-meta.descriptor-on-object" },
    { handler: "silence", matchId: "ember-runtime.deprecate-copy-copyable" }
  ]
};
