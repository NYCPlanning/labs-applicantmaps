import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () { // eslint-disable-line
  this.route('projects', function () {
    this.route('new');
    this.route('edit', { path: ':id/edit' }, function () {
      this.route('map', function () {
        this.route('new');
        this.route('edit', { path: ':map_id' });
      });
    });
  });
});

export default Router;
