import Component from '@ember/component';
import projectGeometryIcons from '../../utils/project-geom-icons';

export default class ProjectGeometriesMapLegend extends Component {
  // required
  // @argument
  model;

  // required
  // @argument
  type;

  projectGeometryIcons = projectGeometryIcons;
}
