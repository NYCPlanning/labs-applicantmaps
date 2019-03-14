import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember-decorators/service';

export default
@tagName('')
class BackToDashboardButtonComponent extends Component {
  // @argument
  model;

  // @argument
  type;

  // @argument
  mode;

  @service
  router;
}
