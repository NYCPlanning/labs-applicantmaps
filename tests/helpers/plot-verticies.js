import { triggerEvent } from '@ember/test-helpers';

const mapboxClickSequence = ['mousedown', 'mouseup', 'click'];

export default async function(
  pairs,
  { mapCanvasSelector = 'canvas.mapboxgl-canvas' } = {},
) {
  await Promise.all(
    pairs.map(async ([clientX, clientY]) => {
      await Promise.all(mapboxClickSequence.map(async (event) => {
        await triggerEvent(
          mapCanvasSelector,
          event,
          { clientX, clientY },
        );
      }));
    }),
  );
}
