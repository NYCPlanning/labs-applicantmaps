import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ProjectGeometriesClassComponent extends Component {
  @argument
  model

  @argument
  mapInstance

  @argument
  projectGeometryMode

  @argument
  selectedLots

  @argument
  lotSelectionMode

  projectGeometryMode = null
}
