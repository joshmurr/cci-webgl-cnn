#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D u_texture; // (16*NUM_FILTERS)x(16*NUM_FILTERS)x1(RED)
uniform sampler2D u_filter;  // (4*NUM_FILTERS)x(4*NUM_FILTERS)x1(RED)
uniform vec2 u_filter_size;
uniform vec2 u_num_filters;
uniform vec2 u_num_filters_prev;
uniform vec2 u_input_size;
uniform vec2 u_input_texel_size;
uniform vec2 u_filter_texel_size;
uniform vec2 u_output_size;
out vec4 outColor;

vec3 get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  vec3 tex_lookup = texture(u_texture, _st + _offset * u_input_texel_size).rrr;// * 2.0 - 1.0;
  vec3 filter_lookup = texture(u_filter, _filter_offset + _offset * u_filter_texel_size).rgb;// * 2.0 - 1.0;

  return tex_lookup * filter_lookup;
} 

void main(){
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = st / u_num_filters_prev;
  vec2 filter_offset = floor(st * u_num_filters_prev) / u_num_filters_prev;// * u_num_filters;

  vec3 sum_filters = vec3(0.0);
  for(float f_x=0.0, inc=1.0/u_num_filters_prev.x; f_x<1.0; f_x+=inc){
    for(float f_y=0.0, inc=1.0/u_num_filters_prev.y; f_y<1.0; f_y+=inc){

      vec2 conv = vec2(f_x, f_y);
      vec2 offset_st = input_st + conv;
      vec2 offset_filter =  conv;

      vec3 sum_row = vec3(0.0);
      for(float y=-0.75; y<1.0; y+=0.5){
        // Fractional Stride on input texture
        sum_row += get(offset_st, offset_filter, vec2(-0.75, y));
        sum_row += get(offset_st, offset_filter, vec2(-0.25, y));
        sum_row += get(offset_st, offset_filter, vec2(0.25, y));
        sum_row += get(offset_st, offset_filter, vec2(0.75, y));
      }
      sum_filters += sum_row / pow(1.7, u_num_filters_prev.x);
    }
  }
  outColor = vec4(sum_filters, 1.0);
}

