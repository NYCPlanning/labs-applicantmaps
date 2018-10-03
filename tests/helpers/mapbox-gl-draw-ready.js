import { waitUntil, triggerEvent, find } from '@ember/test-helpers';

export default async function() {
  await waitUntil(() => {
    triggerEvent(
      'canvas.mapboxgl-canvas',
      'mousemove',
    );

    return find('.mouse-add') || find('.mode-draw_polygon');
  }, { timeout: 30000 });
}
