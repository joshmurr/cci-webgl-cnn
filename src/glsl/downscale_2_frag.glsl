#version 300 es

precision highp float;
precision highp sampler2D;

uniform sampler2D u_texture;
uniform sampler2D u_filter;
uniform vec2 u_filter_size;
uniform vec2 u_num_filters;
uniform vec2 u_num_filters_prev;
uniform vec2 u_input_size;
uniform vec2 u_input_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

float get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  return texture(u_texture, _st + _offset * u_input_texel_size).r
        *((texture(u_filter, (_filter_offset + _offset*2.0) * u_filter_texel_size).r));// * 2.0 - 1.0);
} 

void main() {
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = fract(st);
  //vec2 filter_offset = floor(st) / u_num_filters;
  vec2 filter_offset = floor(st * u_num_filters_prev) / u_num_filters_prev;

  vec2 secondary_filter_offset = vec2(0.0);

  vec3 sum_row = vec3(0.0);
  //for(float f=0.0; f<u_num_filters; f+=1.0){

    for(float y=0.0; y<4.0; y+=1.0){
      sum_row += get(input_st, filter_offset, vec2(0.0, y));
      sum_row += get(input_st, filter_offset, vec2(1.0, y));
      sum_row += get(input_st, filter_offset, vec2(2.0, y));
      sum_row += get(input_st, filter_offset, vec2(3.0, y));
    }

  //}


  float sum = dot(sum_row * 0.125, vec3(1.0)) * 0.333; // Sum vector components and average.
  outColor = vec4(vec3(sum), 1.0);

}
