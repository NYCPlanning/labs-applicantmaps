import { module, test } from 'qunit';
import {
  visit,
  click,
  find,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Acceptance | map styles dont leak state', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('visiting a finished project should only get the tax lots displayed', async function(assert) {
    this.server.create('project', {
      projectName: 'test',
      applicantName: 'test',
      zapProjectId: 'test',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: false,
    });

    await visit('/projects/1');
    await click('[data-test-go-to-dash=""]');
    await click('[data-test-add-area-map=""]');
    await click('[data-test-go-back-to-project=""]');

    assert.notOk(find('[data-test-layer="proposed-zoningdistrict-lines"]'));
    assert.notOk(find('[data-test-layer="commercial-overlays-lines"'));
    assert.notOk(find('[data-test-layer="proposed-special-purpose-districts-fill"'));
  });
});
