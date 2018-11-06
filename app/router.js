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
      this.route('steps', { path: '/' }, function() {
        this.route('development-site');
        this.route('project-area');
        this.route('rezoning');
      });
      this.route('geometry-edit');
      this.route('map', function () {
        this.route('edit');
      });
    });
  });
});

export default Router;
