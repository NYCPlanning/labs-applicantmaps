import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';

@tagName('')
export default class BackToDashboardButtonComponent extends Component {
  @argument
  model;

  @argument
  type;

  @argument
  mode;

  @service
  router;
}
