#version 300 es
precision highp float;
precision highp sampler2D;
 
//in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
uniform vec2 u_num_filters;
uniform vec2 u_input_texel_size;
uniform vec2 u_output_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

vec3 get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  // Returns given pixel value * relavent filter value
  vec2 input_lookup = _st + (_offset*u_input_texel_size);
  vec2 filter_lookup = _filter_offset + (_offset*u_filter_texel_size);
  return texture(u_texture, input_lookup).rgb * texture(u_filter, filter_lookup).rgb;// * 2.0 - vec3(1.0));
} 

void main() {
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = fract(st);
  vec2 filter_offset = floor(st) / u_num_filters;

  vec3 sum_row = vec3(0.0);
  for(float y=-1.5; y<2.0; y+=1.0){
    sum_row += get(input_st, filter_offset, vec2(-1.5, y));
    sum_row += get(input_st, filter_offset, vec2(-0.5, y));
    sum_row += get(input_st, filter_offset, vec2(0.5, y));
    sum_row += get(input_st, filter_offset, vec2(1.5, y));
  }

  float scale = pow(u_num_filters.x * u_num_filters.y, 2.0);
  float sum = dot(sum_row / scale, vec3(1.0)) * 0.333; // Sum vector components and average.
  outColor = vec4(sum, 0.0, 0.0, 1.0);

}
