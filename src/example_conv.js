import Downsample from './downscale_class.js';

const D1 = new Downsample(gl, {
  vs_source: require('./glsl/basic_vert.glsl'),
  fs_source: require('./glsl/downscale_frag.glsl'),
  filter_size: 4,
  num_filters: 4,
  output_size: 16,
});
