#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D u_texture; // (16*NUM_FILTERS)x(16*NUM_FILTERS)x1(RED)
uniform sampler2D u_filter;  // (4*NUM_FILTERS)x(4*NUM_FILTERS)x1(RED)
uniform vec2 u_filter_size; 
uniform vec2 u_num_filters; // (2, 2)
uniform vec2 u_num_filters_prev; // (4, 4)
uniform vec2 u_input_size;
uniform vec2 u_input_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

float get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  float tex_lookup = texture(u_texture, _st + (_offset * u_input_texel_size)).r;// * 2.0 - 1.0;
  float filter_lookup = texture(u_filter, _filter_offset + (((_offset*2.0)+vec2(1.5)) * u_filter_texel_size)).r;// * 2.0 - 1.0;

  return tex_lookup * filter_lookup;
} 

void main(){
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = fract(st) / u_num_filters_prev;
  vec2 filter_offset = floor(st) / u_num_filters;

  float sum_filters = 0.0;

  for(float c_x=0.0, inc=1.0/u_num_filters_prev.x; c_x<1.0; c_x+=inc){
    for(float c_y=0.0, inc=1.0/u_num_filters_prev.y; c_y<1.0; c_y+=inc){

      vec2 conv = vec2(c_x, c_y);
      vec2 offset_st = input_st + conv;
      vec2 offset_filter = filter_offset + conv * u_filter_texel_size;

      float sum_row = 0.0;
      for(float y=-0.75; y<1.0; y+=0.5){
        // Fractional Stride on input texture
        sum_row += get(offset_st, offset_filter, vec2(-0.75, y));
        sum_row += get(offset_st, offset_filter, vec2(-0.25, y));
        sum_row += get(offset_st, offset_filter, vec2(0.25, y));
        sum_row += get(offset_st, offset_filter, vec2(0.75, y));
      }
      sum_filters += sum_row / 16.0;
    }
  }

  //float scale = pow(u_num_filters_prev.x, u_num_filters.y);
  float scale = pow(1.25, u_num_filters_prev.y);
  //float scale = u_num_filters_prev.x * u_num_filters_prev.y;
  float sum = sum_filters / scale;

  outColor = vec4(sum, 0.0, 0.0, 1.0) * 0.5;
  //outColor = texture(u_texture, gl_FragCoord.xy / u_output_size);
}

