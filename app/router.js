import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () { // eslint-disable-line
  this.route('projects', function () {
    this.route('show', { path: ':project_id' });
    this.route('new');
    this.route('edit', { path: ':project_id/edit' }, function () {
      this.route('map', function () {
        this.route('edit');
      });
    });
    this.route('steps', { path: ':project_id/steps' }, function() {
      this.route('development-site');
      this.route('project-area');
      this.route('rezoning');
    });
    this.route('geometry-edit', { path: ':project_id/geometry-edit' });
  });
});

export default Router;
