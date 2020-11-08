#version 300 es
precision highp float;
precision highp sampler2D;
 
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
uniform sampler2D u_bias;  // 4x4x3
//uniform sampler2D u_filter_smask;  // 4x4x3
uniform vec2 u_num_filters;
uniform vec2 u_input_texel_size;
uniform vec2 u_output_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

vec3 get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  vec3 input_lookup = texture(u_texture, _st + (_offset*u_input_texel_size)).rgb;// * 2.0 - 1.0;
  vec3 filter_lookup = texture(u_filter, u_filter_texel_size + _filter_offset + (_offset*u_filter_texel_size)).rgb * 2.0 - 1.0;

  return input_lookup * filter_lookup;// * smask_lookup;
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
  float sum = dot(sum_row, vec3(1.0));// / 16.0  * 0.333; // Sum vector components and average.
  outColor = vec4(sum, 0.0, 0.0, 1.0) + (texture(u_bias, filter_offset + (1.0 / u_num_filters)) * 2.0 - 1.0);

}
