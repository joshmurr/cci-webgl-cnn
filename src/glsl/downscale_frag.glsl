#version 300 es
precision highp float;
precision highp sampler2D;
 
//in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
uniform vec2 u_filter_size;
uniform float u_num_filters;
uniform vec2 u_output_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

vec3 get(vec2 _coord, vec2 _filter_offset, vec2 _offset){
  // Returns given pixel value * relavent filter value
  return texture(u_texture, _coord+_offset*u_output_texel_size).rgb
  *((texture(u_filter, _filter_offset+_offset*u_filter_texel_size).rgb) * 2.0 - vec3(1.0));
} 

void main() {
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = fract(st);
  vec2 filter_offset = floor(st) / u_num_filters;

  vec3 sum_row = vec3(0.0);
  for(float y=0.0; y<4.0; y+=1.0){
    sum_row += get(input_st, filter_offset, vec2(0.0, y));
    sum_row += get(input_st, filter_offset, vec2(1.0, y));
    sum_row += get(input_st, filter_offset, vec2(2.0, y));
    sum_row += get(input_st, filter_offset, vec2(3.0, y));
  }

  float sum = dot(sum_row * 0.0625, vec3(1.0)) * 0.333; // Sum vector components and average.
  outColor = vec4(vec3(sum), 1.0);

}