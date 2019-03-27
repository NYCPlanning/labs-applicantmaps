// takes `id` from properties, and copies it to `id` at the top level of each feature
// used by mapbox-gl-draw to identify features for when editing
export default function(FeatureCollection) {
  // add an id to the top level of each feature object, for use by mapbox-gl-draw
  const { features } = FeatureCollection;

  FeatureCollection.features = features.map((feature) => {
    feature.id = feature.properties.id;
    return feature;
  });

  return FeatureCollection;
}
