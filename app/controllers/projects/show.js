import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { EmptyFeatureCollection } from '../../models/project';
import { developmentSiteLayer } from '../../components/project-geometries/development-site';
import { projectAreaLayer } from '../../components/project-geometries/project-area';
import { rezoningAreaLayer } from '../../components/project-geometries/rezoning-area';
import { underlyingZoningLayer, underlyingZoningLabelsLayer } from '../../components/project-geometries/underlying-zoning';
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
} from '../../components/project-geometries/commercial-overlays';
import { specialPurposeDistrictsLayer, specialPurposeDistrictsLabelsLayer } from '../../components/project-geometries/special-purpose-districts';
import areaMapLegendConfig from '../../utils/area-map-legend-config';

export default class ShowProjectController extends Controller {
  EmptyFeatureCollection = EmptyFeatureCollection;

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

  developmentSiteIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(237, 18, 18, 1)',
        'stroke-width': 1.25,
        'stroke-dasharray': '3,1.25,1.25,1.25',
      },
    ],
  };

  projectAreaIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 122, 122, 1)',
        'stroke-width': 1,
        'stroke-dasharray': '3.25,1.75',
      },
    ],
  };

  underlyingZoningIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 0, 0, 0.7)',
        'stroke-width': 1,
      },
    ],
  };

  commercialOverlaysIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 0, 0, 0.7)',
        'stroke-width': 1,
      },
    ],
  };

  specialPurposeDistrictsIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(94, 102, 51, 0.2)',
        stroke: 'rgba(0, 0, 0, 0)',
        'stroke-width': 0,
      },
    ],
  };

  rezoningAreaIcon = {
    type: 'rectangle',
    layers: [
      {
        fill: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 0, 0, 1)',
        'stroke-width': 2,
        'stroke-dasharray': '0.2,4',
        'stroke-linecap': 'round',
      },
    ],
  };

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
