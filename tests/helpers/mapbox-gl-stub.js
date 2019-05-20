import Component from '@ember/component';
import hbs from 'htmlbars-inline-precompile';
import deepmerge from 'deepmerge';
import { helper } from '@ember/component/helper';
import { classNames, tagName } from '@ember-decorators/component';
import { assign } from '@ember/polyfills';

// Stub for MapboxGL subclasses known as User Interaction Handlers
// see https://docs.mapbox.com/mapbox-gl-js/api/#user%20interaction%20handlers
const UserInteractionHandlerStub = {
  isEnabled: () => {},
  isActive: () => {},
  enable: () => {},
  disable: () => {},
};

// default mapbox instance stub with a few common methods. this is incomplete,
// usually the methods should be added to specific tests
export const defaultMapboxEventStub = {
  mapInstance: {
    addControl: () => {},
    addLayer: () => {},
    areTilesLoaded: () => true,
    fitBounds: () => {},
    getBearing: () => {},
    getCanvas: () => ({ style: {} }),
    getCenter: () => ({ lat: 0, lng: 0, toArray: () => [0, 0] }),
    getStyle: () => ({ sources: {}, layers: {} }),
    getZoom: () => {},
    off: () => {},
    on: () => {},
    queryRenderedFeatures: () => [],
    querySourceFeatures: () => [],
    removeControl: () => {},
    removeLayer: () => {},
    resize: () => {},
    setFilter: () => {},
    setPaintProperty: () => {},
    unproject: () => ({ lat: 0, lng: 0, toArray: () => [0, 0] }),

    scrollZoom: UserInteractionHandlerStub,
    boxZoom: UserInteractionHandlerStub,
    dragRotate: UserInteractionHandlerStub,
    dragPan: UserInteractionHandlerStub,
    keyboard: UserInteractionHandlerStub,
    doubleClickZoom: UserInteractionHandlerStub,
    touchZoomRotate: UserInteractionHandlerStub,
  },
  draw: {
    add: () => {},
    set: () => {},
    getAll: () => ({ features: [] }),
    getSelected: () => [],
    getSelectedPoints: () => ({ features: [] }),
    getSelectedIds: () => [],
    getMode: () => 'simple_select',
    changeMode: () => {},
  },
};

// define a new mapbox-gl class with the layout also stubbed in.
// this will replace the ember-mapbox-gl bindings during tests
@classNames('mapbox-gl')
export class MapboxGl extends Component {
  mapLoaded = () => {}

  // current test context, used to contain reference to
  // test scope for dependency injections & stubbing
  // mapbox-gl methods
  mapboxEventStub = defaultMapboxEventStub;

  init(...args) {
    // mapLoaded is an ember-mapbox-gl convenience
    // which specifically sends out the "target"
    // as the map instance
    this.map = this.mapboxEventStub.mapInstance;
    this.mapLoaded(this.map);

    super.init(...args);
  }

  // this is a layout stub which is necessary to replace contextual components
  // that descend from {{mapbox-gl}}
  // as more ember-mapbox-gl contextual components are needed for stubbing,
  // they must be added here
  layout = hbs`
    {{!-- Highlighted Layer Handling --}}

    {{yield (assign 
      (hash
        on=(component 'mapbox-gl-on'
          eventSource=this.mapboxEventStub.mapInstance
        )
        source=(component 'mapbox-gl-source'
          map=this.map
        )
        layer=(component 'mapbox-gl-layer'
          map=this.map
        )

        draw=this.mapboxEventStub.draw

        mapInstance=this.mapboxEventStub.mapInstance
      )
      this.mapboxEventStub
    )}}
  `;
}

// stub for mapbox-gl-on, the ember-mapbox-gl interface for binding events
@tagName('')
export class MapboxOn extends Component {
  // this component gets "positional params" so that it can be invoked as follows:
  // {{map.on 'someEvent' (action 'myAction')}}
  static positionalParams = ['event', 'optionalLayerId', 'action'];

  // the core functionality of mapbox-gl-on is handled on init by binding
  // the passed event name with the passed action.
  init(...args) {
    super.init(...args);

    // the component allows for an optional id to be passed as the second argument.
    // if it's not passed, we have to make sure the action gets set correctly
    if (!this.action) this.action = this.optionalLayerId;

    this.eventSource.on(this.event, this.action);
  }

  // see mapbox-gl stub class - the layout hands a reference to itself down
  eventSource;
}

export class MapboxGlSource extends Component {
  layout = hbs`
    {{yield (hash
      layer = (component 'mapbox-gl-layer')
    )}}
  `;
}

// main export used in qunit tests to pull in the mapbox-gl stub
// `setupMapboxStubs(hooks);`
// This also defines an extension of the mapbox-gl stub so that the
// test context can be pulled in.
// When this is used, each test will have access to a stub property
// called `mapboxEventStub`, allowing insertion of mock methods/properties
// or references for intercepting events:
//
// Mock response for an internal mapbox-gl method:
// this.mapboxEventStub = {
//   mapInstance: {
//     querySourceFeatures() {
//       return [mockFeature];
//     },
//   },
// };

// Intercept mapbox-gl events and trigger artificially:
// const artificialEvents = {};
// this.mapboxEventStub = {
//   mapInstance: {
//     on: (event, func) => {
//       artificialEvents[event] = func;
//     },
//   },
// };
//
// artificialEvents.click(triangleFC);
//
// In the example above, artificialEvents.click() directly calls the event callback
// for the mapbox-gl `click` event. The argument is whatever that callback is provided
// as an argument.
export default function(hooks) {
  hooks.beforeEach(function() {
    let _mapboxEventStub = defaultMapboxEventStub;
    Object.defineProperty(this, 'mapboxEventStub', {
      get() {
        return _mapboxEventStub;
      },
      set(val) {
        _mapboxEventStub = deepmerge(defaultMapboxEventStub, val);
      },
    });

    const that = this;
    // extend stub and bind in the current test context so it can be
    // dynamically referenced
    class MapboxGlStub extends MapboxGl {
      init(...args) {
        this.mapboxEventStub = that.mapboxEventStub;
        super.init(...args);
      }
    }

    // template helper used in the template for the mocks above. this helper
    // simple merges multiple objects into one. it's helpful for extending objects
    // that're usually yielded out from a component.
    this.owner.register('helper:assign', helper(function(hashes, hash) {
      return assign({}, ...hashes, hash);
    }));

    // ember/qunit interface for stubbing in the above classes, replacing
    // the mapbox-gl dependencies in test mode
    this.owner.register('component:mapbox-gl-on', MapboxOn);
    this.owner.register('component:mapbox-gl-layer', Component);
    this.owner.register('component:mapbox-gl-source', MapboxGlSource);

    // main, wrapping mapbox-gl component
    this.owner.register('component:mapbox-gl', MapboxGlStub);
  });
}
