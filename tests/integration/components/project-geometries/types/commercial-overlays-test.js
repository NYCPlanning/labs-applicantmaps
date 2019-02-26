import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, clearRender } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | project-geometries/commercial-overlays', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('error message shows up', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.server.create('project');
    this.server.get('/projects/:id', { errors: ['Error has occurred'] }, 500); // force mirage to errors

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{project-geometries/types/commercial-overlays map=map}}
      {{/mapbox-gl}}
    `);

    assert.ok(true);
  });


  // note: this test checks underlying-zoning, commercial-overlays, AND special-purpose-districts
  test('it fetches canonical geometry for ALL canonical types', async function(assert) {
    assert.expect(11);
    // stub in the current mode service with a noop method
    this.owner.register('service:current-mode', Service.extend({
      componentInstance: {
        shouldReset() {
          assert.ok(true);
        },
      },
    }));

    // stub in a mock model with some fake methods
    this.set('model', {
      setCanonical() {
        assert.ok(true);
      },
      project: {
        setRezoningArea() {
          assert.ok(true);
        },
        geometricProperties: [{
          geometryType: 'rezoningArea',
          setRezoningArea() {},
          setCanonical() {},
          save() {},
        }],

        // utility getter
        get(prop) {
          return this[prop];
        },
      },

      // utility getter
      get(prop) {
        return this[prop];
      },
    });

    this.set('save', function() {
      assert.ok(true);
    });

    for (let type of ['commercial-overlays', 'special-purpose-districts', 'underlying-zoning']) { // eslint-disable-line
      this.set('type', type);

      /* eslint-disable-line */ await render(hbs`
        <div id="geometry-type-draw-explainer"></div>
        {{component (concat 'project-geometries/types/' type)
          isReadyToProceed=true
          save=(action save)
          model=model}}
      `);

      await click('[data-test-project-geometry-save]'); /* eslint-disable-line */ 
      await clearRender(); /* eslint-disable-line */ 
    }
  });
});
