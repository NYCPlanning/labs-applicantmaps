import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | project', (hooks) => {
  setupTest(hooks);

  // Test for project not yet created
  test('it produces project-creation step', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project'));
    assert.equal(model.get('currentStep.label'), 'project-creation');
  });

  // Test for project created but development site not yet defined
  test('it produces development-site step', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
    }));
    assert.equal(model.get('currentStep.label'), 'development-site');
  });

  // Test for project completion when only development site is required
  test('it produces complete status', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      developmentSite: { anObject: 'exists in here' },
      needProjectArea: false,
      needRezoning: false,
    }));
    assert.equal(model.get('currentStep.label'), 'complete');
  });

  // Test for project incomplete project that hasn't answered rezoning question
  skip('it produces rezoning step', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('project', {
      projectName: 'some project',
      developmentSite: { anObject: 'exists in here' },
      needProjectArea: false,
      needRezoning: null,
    }));
    assert.equal(model.get('currentStep.label'), 'rezoning');
  });
});
