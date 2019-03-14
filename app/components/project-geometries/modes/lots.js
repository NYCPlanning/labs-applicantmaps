import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import turfBuffer from '@turf/buffer';
import turfUnion from '@turf/union';
import turfSimplify from '@turf/simplify';
import { set } from '@ember/object';
import carto from 'cartobox-promises-utility/utils/carto';
import { task } from 'ember-concurrency-decorators';
import { waitForProperty } from 'ember-concurrency';
import { inject as service } from '@ember-decorators/service';

const tolerance = 0.000001;
const bufferkm = 0.00008;
const plutoTable = 'mappluto_v18_1';

export const selectedLotsLayer = {
  type: 'fill',
  paint: {
    'fill-color': 'rgba(217, 216, 1, 1)',
    'fill-outline-color': 'rgba(255, 255, 255, 1)',
  },
};

export default class LotsComponent extends Component {
  constructor(...args) {
    super(...args);

    // selectedLots
    this.set('selectedLots', {
      type: 'FeatureCollection',
      features: [],
    });

    // Add the interactive tax lots layer group to the store
    const interactiveTaxLotsLayerGroup = this.store.createRecord('layer-group', {
      id: 'tax-lots-interactive',
      visible: true,
    });

    // Add the interactive tax lots layer to the store
    this.store.createRecord('layer', {
      id: 'pluto-fill-interactive',
      style: {
        id: 'pluto-fill-interactive',
        type: 'fill',
        source: 'pluto',
        minzoom: 15,
        'source-layer': 'pluto',
        paint: {
          'fill-opacity': 0,
        },
      },
      clickable: true,
      layerGroup: interactiveTaxLotsLayerGroup,
    });
  }

  @argument
  map;

  @argument
  geometricProperty;

  @service
  store;

  selectedLotsLayer = selectedLotsLayer;

  @computed()
  get interactiveTaxLots() {
    return this.get('store').peekRecord('layer-group', 'tax-lots-interactive');
  }

  @computed('geometricProperty.features.@each.geometry')
  get selectedLotsSource() {
    const selectedLots = this.get('geometricProperty');
    return {
      type: 'geojson',
      data: selectedLots,
    };
  }

  generateBuffer() {
    const { features } = this.get('selectedLots');

    if (!features.length) {
      this.set('geometricProperty', {
        type: 'FeatureCollection',
        features: [],
      });
      return;
    }
    const [{ geometry }] = features;
    const { length } = features;

    waitForProperty(this, 'hydrateFeatures.isIdle')
      .then(() => {
        let union = turfBuffer(geometry, bufferkm);

        if (length > 1) {
          for (let i = 1; i < length; i += 1) {
            const bufferedGeometry = turfBuffer(features[i].geometry, bufferkm);

            union = turfUnion(union, bufferedGeometry);
          }
        }

        const Feature = turfSimplify(union, { tolerance });

        // wrap as FC
        this.set('geometricProperty', {
          type: 'FeatureCollection',
          features: [Feature],
        });
      });
  }

  // Hydrate geometric fragments with true lot data
  @task
  hydrateFeatures = function* (feature) {
    const { properties } = feature;
    const targetFeature = this.get('selectedLots.features')
      .find(({ properties: { bbl } }) => bbl === properties.bbl);
    const bblSelectionQuery = `SELECT the_geom FROM ${plutoTable} WHERE bbl = ${properties.bbl}`;
    const { features: [{ geometry }] } = yield carto.SQL(bblSelectionQuery, 'geojson');

    set(targetFeature, 'geometry', geometry);

    // features are hydrated so generate buffer
    this.generateBuffer();
  }

  @action
  handleLayerClick(feature) {
    const { properties } = feature; // geometry is fragment
    const selectedLots = this.get('selectedLots');

    // if the lot is not in the selection, push it, if it is, remove it
    const inSelection = selectedLots
      .features
      .find(lot => lot.properties.bbl === properties.bbl);

    if (inSelection === undefined) {
      this.get('selectedLots.features')
        .pushObject(feature);

      this.get('hydrateFeatures').perform(feature); // task to fetch full feature;
    } else {
      const newLots = selectedLots
        .features
        .filter(lot => lot.properties.bbl !== properties.bbl);

      this.set('selectedLots.features', newLots);
      this.generateBuffer();
    }
  }

  willDestroyElement() {
    // Remove the interactive tax lots layer from the store
    const destroyableTaxLotsLayer = this.get('store').peekRecord('layer', 'pluto-fill-interactive');
    destroyableTaxLotsLayer.unloadRecord();

    // Remove the interactive tax lots layer group from the store
    const destroyableTaxLotsLayerGroup = this.get('store').peekRecord('layer-group', 'tax-lots-interactive');
    destroyableTaxLotsLayerGroup.unloadRecord();
  }
}
