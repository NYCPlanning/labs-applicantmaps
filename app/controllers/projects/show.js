import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { developmentSiteLayer } from '../../components/project-geometries/development-site';
import { projectAreaLayer } from '../../components/project-geometries/project-area';
import { rezoningAreaLayer } from '../../components/project-geometries/rezoning-area';
import { underlyingZoningLayer, underlyingZoningLabelsLayer } from '../../components/project-geometries/underlying-zoning';
import { specialPurposeDistrictsLayer, specialPurposeDistrictsLabelsLayer } from '../../components/project-geometries/special-purpose-districts';


import areaMapLegendConfig from '../../utils/area-map-legend-config';

export default class ShowProjectController extends Controller {
  projectAreaLayer = projectAreaLayer;

  developmentSiteLayer = developmentSiteLayer;

  rezoningAreaLayer = rezoningAreaLayer;

  underlyingZoningLayer = underlyingZoningLayer;

  underlyingZoningLayer = underlyingZoningLabelsLayer

  specialPurposeDistrictsLayer = specialPurposeDistrictsLayer

  specialPurposeDistrictsLabelsLayer = specialPurposeDistrictsLabelsLayer

  areaMapLegendConfig = areaMapLegendConfig;

  @action
  handleMapLoad(map) {
    window.map = map;

    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
