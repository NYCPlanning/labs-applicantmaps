import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ProjectSetupComponent from 'labs-applicant-maps/components/project-setup-status';

module('Integration | Component | project-setup-status', function(hooks) {
  setupRenderingTest(hooks);

  test('copy-button integration', async function(assert) {
    this.owner.register('component:project-setup-status', ProjectSetupComponent.extend({
      'data-test-project-setup-status': true,
      click() {
        this.handleShareSuccess();
        this.handleShareError();
      },
    }));

    await render(hbs`{{project-setup-status}}`);
    await click('[data-test-project-setup-status]');

    assert.ok(true);
  });
});
