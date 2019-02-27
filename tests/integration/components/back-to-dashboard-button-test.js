import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | back-to-dashboard-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it only renders if model.currentStep is complete', async function(assert) {
    const completeModel = {
      currentStep: {
        step: 'complete',
      },
    };

    this.set('model', completeModel);
    await render(hbs`{{back-to-dashboard-button model=model}}`);

    assert.equal(this.element.textContent.trim(), 'Cancel');

    const incompleteModel = {
      currentStep: {
        step: 'developmentSite',
      },
    };

    this.set('model.currentStep.step', incompleteModel);
    await render(hbs`{{back-to-dashboard-button model=model}}`);

    assert.equal(this.element.textContent.trim(), 'Cancel');
  });
});
