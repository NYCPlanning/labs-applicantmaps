import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | project-geometry-renderer', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  // todo: refactor "mystery guest" antipattern, which is that the factory for project
  // implicitly includes a developmentSite upon generation.
  test('it does not render any layers if there are not project geometries set on the model', async function(assert) {
    this.server.create('project', 'hasDevelopmentSite');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    this.model = model;

    const artificialEvents = {};
    this.mapboxEventStub = {
      mapInstance: {
        on: (event, func) => {
          artificialEvents[event] = func;
        },
      },
    };

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{project-geometry-renderer map=map model=model}}
      {{/mapbox-gl}}
    `);

    assert.ok(find('[data-test-layer="development-site-line"]'));
    assert.notOk(find('[data-test-layer="project-buffer-line"]'));
    assert.notOk(find('[data-test-layer="rezoning-area-line"]'));
    assert.notOk(find('[data-test-layer="underlying-zoning-line"]'));
    assert.notOk(find('[data-test-layer="co_outline"]'));
    assert.notOk(find('[data-test-layer="proposed-special-purpose-districts-fill"]'));
  });

  test('it renders a developmentSite if one exists on the model', async function(assert) {
    this.server.create('project', 'hasDevelopmentSite');
    const store = this.owner.lookup('service:store');
    const model = await store.findRecord('project', 1, { include: 'geometric-properties' });

    this.model = model;

    await render(hbs`
      {{#mapbox-gl as |map|}}
        {{project-geometry-renderer map=map model=model}}
      {{/mapbox-gl}}
    `);

    assert.ok(find('[data-test-layer="development-site-line"]'));
  });
});
