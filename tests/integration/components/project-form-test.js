import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('Integration | Component | project-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it disables clicking if not filled out', async function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {}));
    this.set('model', model);
    await render(hbs`{{project-form model=model}}`);

    assert.equal(this.element.querySelector('[data-test-create-new-project]').disabled, true);

    await fillIn('[data-test-new-project-project-name]', 'Mulholland Drive');

    assert.equal(this.element.querySelector('[data-test-create-new-project]').disabled, false);
  });
});
