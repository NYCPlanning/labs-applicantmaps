import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | draw-control', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('projectGeometryMode', null);

    // Template block usage:
    await render(hbs`
      {{#draw-control}}
        mode="developmentSite"
        modeDisplayName="Development Site"
        projectGeometryMode=projectGeometryMode
      {{/draw-control}}
    `);

    // This text can't be predicted. It's changed and is now dynamic, based on the modeDisplayName
    assert.equal(this.element.textContent.trim(), `Use the drawing tools on the map to define the development site OR click below to create your site by selecting tax lots
      Select Tax Lots

        Done
        Cancel`);
  });
});
