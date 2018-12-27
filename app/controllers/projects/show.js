import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { EmptyFeatureCollection } from '../../models/project';

export default class ShowProjectController extends Controller {
  EmptyFeatureCollection = EmptyFeatureCollection;

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
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
