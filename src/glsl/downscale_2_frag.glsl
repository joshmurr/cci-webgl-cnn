#version 300 es

precision highp float;
precision highp sampler2D;

uniform sampler2D u_texture;
uniform sampler2D u_filter;
uniform vec2 u_num_filters;
uniform vec2 u_num_filters_prev;
uniform vec2 u_input_size;
uniform vec2 u_input_texel_size;
uniform vec2 u_output_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

//float get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  //float input_lookup = texture(u_texture, _st + (_offset*u_input_texel_size)).r;// * 2.0 - 1.0;
  //float filter_lookup = texture(u_filter, _filter_offset + (_offset*u_filter_texel_size)).r;/[> 2.0 - 1.0;

  //return input_lookup * filter_lookup;
//} 
float get(vec2 _input, vec2 _filter,vec2 _offset){
  float input_val  = texture(u_texture, _input + (_offset * u_input_texel_size)).r;
  float filter_val = texture(u_filter, _filter + (_offset * u_filter_texel_size)).r;

  return input_val * filter_val;
} 

void main() {
  vec2 st = gl_FragCoord.xy / u_output_size; // (0 -> 32) / 8 = 0 -> 4
  vec2 input_st = fract(st) / u_num_filters_prev;// fract(0 -> 4) / 2 = 0 -> 0.5
  vec2 filter_st =  floor(st) / u_num_filters; // floor(0 -> 4) / 4 = [0, 0.25, 0.5, 0.75]

  //input_st += floor(

  float sum_row = 0.0;

  //for(float f_x=0.0, inc=1.0/u_num_filters_prev.x; f_x<1.0; f_x+=inc){
    //for(float f_y=0.0, inc=1.0/u_num_filters_prev.y; f_y<1.0; f_y+=inc){
  for(float f_x=0.0; f_x<u_num_filters_prev.x; f_x+=1.0){
    for(float f_y=0.0; f_y<u_num_filters_prev.y; f_y+=1.0){

      vec2 layer = vec2(f_x, f_y);
      vec2 input_loc = input_st + (layer / u_num_filters_prev);
      vec2 filter_loc = filter_st + (layer * u_filter_texel_size * 4.0);

      //vec2 offset_st = input_st + conv;
      //vec2 offset_filter = filter_offset + conv * u_filter_texel_size;// + conv;

      for(float y=-1.5; y<2.0; y+=1.0){
        //sum_row += get(offset_st, offset_filter, vec2(-1.5, y));
        //sum_row += get(offset_st, offset_filter, vec2(-0.5, y));
        //sum_row += get(offset_st, offset_filter, vec2(0.5, y));
        //sum_row += get(offset_st, offset_filter, vec2(1.5, y));
        sum_row += get(input_loc, filter_loc, vec2(-1.5, y));
        sum_row += get(input_loc, filter_loc, vec2(-0.5, y));
        sum_row += get(input_loc, filter_loc, vec2( 0.5, y));
        sum_row += get(input_loc, filter_loc, vec2( 1.5, y));
      }
    }
  }

  float scale = pow(1.3, u_num_filters.x);
  //float scale = 1.0;
  float sum = sum_row / scale; // Sum vector components and average.

  outColor = vec4(sum, 0.0, 0.0, 1.0);

}
