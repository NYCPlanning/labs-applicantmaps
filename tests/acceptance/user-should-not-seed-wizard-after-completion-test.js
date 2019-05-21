import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  settled,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupMapMocks from 'labs-applicant-maps/tests/helpers/mapbox-gl-stub';
import setupComposerMocks from 'labs-applicant-maps/tests/helpers/mapbox-composer-stub';

module('Acceptance | user should not be bounced back to wizard if complete', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupMapMocks(hooks);
  setupComposerMocks(hooks);

  test('visiting a completed project shows the dashboard', async function(assert) {
    this.server.create('project', {
      projectName: 'test',
      applicantName: 'test',
      zapProjectId: 'test',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: false,
      hasCompletedWizard: true,
    });

    await visit('/projects/1');

    assert.equal(currentURL(), '/projects/1');
  });

  test('visiting a completed project, adding underlying zoning, then hitting back should should dashboard', async function(assert) {
    this.server.create('project', {
      projectName: 'test',
      applicantName: 'test',
      zapProjectId: 'test',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: false,
      hasCompletedWizard: true,
    });

    await visit('/projects/1');

    await click('[data-test-underlying-zoning=""]');

    // There's some uncaptured async happening somewhere and we need this
    // to wait for it... not sure why
    await settled();

    await click('[data-test-geometry-edit-cancel=""]');

    assert.equal(currentURL(), '/projects/1');
  });

  test('visiting a completed project, adding comm overlay, then hitting back should should dashboard', async function(assert) {
    this.server.create('project', {
      projectName: 'test',
      applicantName: 'test',
      zapProjectId: 'test',
      needDevelopmentSite: true,
      needProjectArea: false,
      needRezoning: false,
      hasCompletedWizard: true,
    });

    await visit('/projects/1');

    await click('[data-test-commercial-overlays=""]');

    // There's some uncaptured async happening somewhere and we need this
    // to wait for it... not sure why
    await settled();

    await click('[data-test-geometry-edit-cancel=""]');

    assert.equal(currentURL(), '/projects/1');
  });
});
