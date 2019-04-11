import Component from '@ember/component';
import { developmentSiteLayer } from './project-geometries/types/development-site';
import { projectAreaLayer } from './project-geometries/types/project-area';
import { rezoningAreaLayer } from './project-geometries/types/rezoning-area';
import { underlyingZoningLayer, underlyingZoningLabelsLayer } from './project-geometries/types/underlying-zoning';
import {
  commercialOverlaysLayer,
  coLayer,
  c11Layer,
  c12Layer,
  c13Layer,
  c14Layer,
  c15Layer,
  c21Layer,
  c22Layer,
  c23Layer,
  c24Layer,
  c25Layer,
} from './project-geometries/types/commercial-overlays';
import { specialPurposeDistrictsLayer, specialPurposeDistrictsLabelsLayer } from './project-geometries/types/special-purpose-districts';
import areaMapLegendConfig from '../utils/area-map-legend-config';


export default class ProjectGeometryRendererController extends Component {
  type;

  projectAreaLayer = projectAreaLayer;

  developmentSiteLayer = developmentSiteLayer;

  rezoningAreaLayer = rezoningAreaLayer;

  underlyingZoningLayer = underlyingZoningLayer;

  underlyingZoningLabelsLayer = underlyingZoningLabelsLayer

  commercialOverlaysLayer = commercialOverlaysLayer;

  specialPurposeDistrictsLayer = specialPurposeDistrictsLayer

  specialPurposeDistrictsLabelsLayer = specialPurposeDistrictsLabelsLayer

  areaMapLegendConfig = areaMapLegendConfig;

  coLayer = coLayer;

  c11Layer = c11Layer;

  c12Layer = c12Layer;

  c13Layer = c13Layer;

  c14Layer = c14Layer;

  c15Layer = c15Layer;

  c21Layer = c21Layer;

  c22Layer = c22Layer;

  c23Layer = c23Layer;

  c24Layer = c24Layer;

  c25Layer = c25Layer;
}
