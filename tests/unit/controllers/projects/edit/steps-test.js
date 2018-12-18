import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Controller | projects/edit/steps', function(hooks) {
  setupTest(hooks);

  test('currentStepNumber is defined by the nested route', function(assert) {
    this.owner.register('service:router', Service.extend({
      currentRouteName: 'index',
    }));

    const routerServiceStub = this.owner.lookup('service:router');
    const controller = this.owner.lookup('controller:projects/edit/steps');

    routerServiceStub.set('currentRouteName', 'projects.edit.steps.development-site');
    assert.equal(controller.get('currentStepNumber'), 1);

    routerServiceStub.set('currentRouteName', 'projects.edit.steps.project-area');
    assert.equal(controller.get('currentStepNumber'), 2);

    routerServiceStub.set('currentRouteName', 'projects.edit.steps.rezoning');
    assert.equal(controller.get('currentStepNumber'), 3);
  });
});
