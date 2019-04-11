import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  fillIn, click, render, find,
} from '@ember/test-helpers';
import { run } from '@ember/runloop';
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

  test('it saves the updated project fields', async function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'Test Project',
      applicantName: 'Test Applicant',
      zapProjectId: 'P123456',
    }));

    this.set('model', model);
    await render(hbs`{{project-setup-status
      project=model
    }}`);

    // project name
    let field = 'project-name';
    let fieldCc = 'projectName';
    await click(`[data-test-inline-edit="${field}"] .edit-button`);
    await fillIn(`[data-test-inline-edit="${field}"] .ember-inline-edit-input`, 'UPDATED');
    await click(`[data-test-inline-edit="${field}"] .save-button`);

    assert.equal(this.get(`model.${fieldCc}`), 'UPDATED', 'model is updated');
    assert.equal(find(`[data-test-inline-edit="${field}"]`).textContent.trim().replace(/\s+/g, ' '), 'UPDATED Edit', 'DOM is updated');

    // applicant name
    field = 'applicant-name';
    fieldCc = 'applicantName';
    await click(`[data-test-inline-edit="${field}"] .edit-button`);
    await fillIn(`[data-test-inline-edit="${field}"] .ember-inline-edit-input`, 'UPDATED');
    await click(`[data-test-inline-edit="${field}"] .save-button`);

    assert.equal(this.get(`model.${fieldCc}`), 'UPDATED', 'model is updated');
    assert.equal(find(`[data-test-inline-edit="${field}"]`).textContent.trim().replace(/\s+/g, ' '), 'UPDATED Edit', 'DOM is updated');

    // zap project id
    field = 'zap-project-id';
    fieldCc = 'zapProjectId';
    await click(`[data-test-inline-edit="${field}"] .edit-button`);
    await fillIn(`[data-test-inline-edit="${field}"] .ember-inline-edit-input`, 'UPDATED');
    await click(`[data-test-inline-edit="${field}"] .save-button`);

    assert.equal(this.get(`model.${fieldCc}`), 'UPDATED', 'model is updated');
    assert.equal(find(`[data-test-inline-edit="${field}"]`).textContent.trim().replace(/\s+/g, ' '), 'UPDATED Edit', 'DOM is updated');
  });
});
