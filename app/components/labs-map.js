import LabsMap from 'ember-mapbox-composer/components/labs-map';
import layout from 'ember-mapbox-composer/templates/components/labs-map';
import { registerWaiter } from '@ember/test';
import config from 'labs-applicant-maps/config/environment';

export default class extends LabsMap {
  constructor(...args) {
    super(...args);

    if (config.environment === 'test') {
      registerWaiter(() => this.map);
    }
  }

  layout = layout;
}
