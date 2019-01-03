import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/setup-map-mocks';
import createMap from 'labs-applicant-maps/tests/helpers/create-map';
import { DefaultDraw } from 'labs-applicant-maps/components/mapbox-gl-draw';

module('Integration | Component | project-geometries/modes/draw/annotation', function(hooks) {
  setupRenderingTest(hooks);
  setupMapMocks(hooks);

  hooks.before(async function() {
    this.map = await createMap();
    this.draw = new DefaultDraw();
  });

  hooks.after(function() {
    this.map.remove();
  });

  test('it renders', async function(assert) {
    const { map, draw } = this;

    this.set('mapObject', {
      mapInstance: map,
      draw,
    });

    await render(hbs`
      {{#mapbox-gl-draw map=mapObject as |drawable|}}
        {{project-geometries/modes/draw/annotation
          map=drawable}}
      {{/mapbox-gl-draw}}
    `);

    assert.ok(this.element.textContent);
  });
});
