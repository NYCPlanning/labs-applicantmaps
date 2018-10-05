import EmberObject from '@ember/object';
import QueryParamMapMixin from 'labs-applicant-maps/mixins/query-param-map';
import { module, test } from 'qunit';

module('Unit | Mixin | query-param-map', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const QueryParamMapObject = EmberObject.extend(QueryParamMapMixin);
    const subject = QueryParamMapObject.create();
    assert.ok(subject);
  });
});
