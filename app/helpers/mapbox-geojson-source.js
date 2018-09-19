import { helper } from '@ember/component/helper';

export function mapboxGeojsonSource([data]) {
  return {
    type: 'geojson',
    data,
  };
}

export default helper(mapboxGeojsonSource);
