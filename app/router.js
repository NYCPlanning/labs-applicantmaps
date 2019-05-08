import EmberRouter from '@ember/routing/router';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import config from './config/environment';


const Router = EmberRouter.extend({
  metrics: service(),
  didTransition(...args) {
    this._super(...args);
    this._trackPage();
  },

  _trackPage() {
    scheduleOnce('afterRender', this, () => {
      const page = this.url;
      const title = this.getWithDefault('currentRouteName', 'unknown');
      this.metrics.trackPage({ page, title });
    });
  },

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
        this.route('complete');
      });
      this.route('geometry-edit');
      this.route('map', function () {
        this.route('edit');
      });
    });
  });
});

export default Router;
