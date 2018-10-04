import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBuffer from 'npm:@turf/buffer';
import turfUnion from 'npm:@turf/union';
import turfBbox from 'npm:@turf/bbox';
import { camelize } from '@ember/string';
import config from '../config/environment';

const { mapTypes } = config;
const { Model } = DS;

const requiredFields = [
  'projectName',
  'developmentSite',
];

export default class ProjectModel extends Model.extend({}) {
  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @computed(...mapTypes.map(type => `${camelize(type)}.@each.length`))
  get applicantMaps() {
    const maps = this.getProperties('areaMaps', 'taxMaps', 'zoningChangeMaps', 'zoningSectionMaps');
    return Object.values(maps).reduce((acc, curr) => acc.concat(...curr.toArray()), []);
  }

  @attr() projectArea

  @attr() developmentSite

  @attr() rezoningArea

  @attr() proposedZoning

  @attr() proposedCommercialOverlays

  @attr() proposedSpecialPurposeDistricts

  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  @computed(...requiredFields)
  get isValid() {
    return requiredFields.every(field => this.get(field));
  }

  @computed('projectArea')
  get projectAreaSource() {
    const projectArea = this.get('projectArea');
    return {
      type: 'geojson',
      data: projectArea,
    };
  }

  @computed('developmentSite', 'projectArea', 'rezoningArea')
  get projectGeometryBoundingBox() {
    // build a geojson FeatureCollection from all three project geoms
    const geometries = this.getProperties('developmentSite', 'projectArea', 'rezoningArea');

    // if all three are undefined, return undefined
    const allUndefined = Object.values(geometries)
      .reduce((acc, geometry) => acc && !geometry, true);
    if (allUndefined) return undefined;

    const featureCollection = Object.values(geometries)
      .reduce((acc, geometry) => {
        if (geometry) {
          acc.features.push({
            type: 'Feature',
            geometry,
          });
        }

        return acc;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    return turfBbox.default(featureCollection);
  }

  // union all geometries together, draw a 600 foot buffer around the union
  @computed('developmentSite', 'projectArea', 'rezoningArea')
  get projectGeometryBuffer() {
    const geometries = this.getProperties('developmentSite', 'projectArea', 'rezoningArea');

    const projectGeometryUnion = Object.values(geometries).reduce((union, geometry) => {
      if (geometry) {
        if (union === null) {
          union = geometry;
        } else {
          union = turfUnion.default(union, geometry);
        }
      }

      return union;
    }, null);

    return turfBuffer(projectGeometryUnion, 0.113636, { units: 'miles' });
  }
}
