import hbs from 'htmlbars-inline-precompile';
import { MapboxGl as MapboxGlStub } from './mapbox-gl-stub';

// need artificial handlers for clicks emitted by labs-layers
export class LabsMap extends MapboxGlStub {
  layout = hbs`
    {{!-- Highlighted Layer Handling --}}

    {{yield (assign 
      (hash
        labs-layers=(component 'labs-layers'
          layers=(array
            (hash
              clickable=true
            )
          )
          map=this.mapboxEventStub.mapInstance
        )

        on=(component 'mapbox-gl-on'
          eventSource=this
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

export default function(hooks) {
  hooks.beforeEach(function() {
    const that = this;
    // extend stub and bind in the current test context so it can be
    // dynamically referenced
    class LabsMapStub extends LabsMap {
      init(...args) {
        this.mapboxEventStub = that.mapboxEventStub;

        super.init(...args);
      }
    }

    this.owner.register('component:labs-map', LabsMapStub);
  });
}
