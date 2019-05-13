import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import deepmerge from 'deepmerge';

// this is static...
const defaultMapboxDrawStub = {
  // structure defined in the app
  draw: {
    // actual mapbox-gl-draw stub interface
    drawInstance: {

    },
  },
};

// need artificial handlers for clicks emitted by labs-layers
export class MapboxGlDraw extends Component {
  init(...args) {
    super.init(...args);

    // only extract the _draw_ portion of deep merge here
    const { draw } = deepmerge(defaultMapboxDrawStub, this.testContext.mapboxEventStub || {});

    this.map.draw = draw;

    this.currentMode.componentInstance = this.map.draw;
  }

  @service
  currentMode;

  map = {};

  layout = hbs`
    {{!-- Highlighted Layer Handling --}}

    {{yield map}}
  `;
}

export default function(hooks) {
  hooks.beforeEach(function() {
    const that = this;
    // extend stub and bind in the current test context so it can be
    // dynamically referenced
    class MapboxGlDrawStub extends MapboxGlDraw {
      init(...args) {
        this.testContext = that;

        super.init(...args);
      }
    }

    // this.owner.register('component:labs-layers', LabsLayers);
    this.owner.register('component:mapbox-gl-draw', MapboxGlDrawStub);
  });
}
