import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-setup-status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the project name, applicant, and project number', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('model', {
      projectName: 'Test Project',
      applicantName: 'Test Applicant',
      zapProjectId: 'P123456',
    });

    await render(hbs`{{project-setup-status
      project=model
    }}`);

    assert.equal(find('h1').textContent.trim().replace(/\s+/g, ' '), 'Test Project Edit');
    assert.equal(find('[data-test-applicant-name]').textContent.trim().replace(/\s+/g, ' '), 'Test Applicant Edit');
    assert.equal(find('[data-test-zap-project-id]').textContent.trim().replace(/\s+/g, ' '), 'P123456 Edit');
  });
});
