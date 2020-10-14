#version 300 es
precision highp float;
precision highp sampler2D;

//in vec2 v_texcoord;
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

vec3 get(vec2 _coord, vec2 _filter_offset, vec2 _offset){
  return texture(u_texture, _coord + (_offset * (1.0 /  u_num_filters_prev))).rrr;
  //return vec3(1.0);
} 

void main(){
  // Input tex:  16*NUM_FILTERS x 16*NUM_FILTERS x 1
  // Output tex: 32 x 32 x 3
  vec2 coord = (gl_FragCoord.xy / u_output_size) ;// * u_num_filters_prev;
  vec2 input_coord =(coord / u_num_filters_prev);// * u_num_filters_prev;
  vec2 filter_offset = coord * u_filter_size;

  vec3 sum_row = vec3(0.0);
  for(float f_x=0.0; f_x<u_num_filters_prev.x; f_x+=1.0){
    for(float f_y=0.0; f_y<u_num_filters_prev.y; f_y+=1.0){
      // DO FILTER 4x4 ROUTINE
      sum_row += get(input_coord, filter_offset, vec2(f_x, f_y));
    }
  }


  float sum = dot(sum_row / (u_num_filters_prev.x * u_num_filters_prev.y), vec3(1.0)) * 0.333; // Sum vector components and average.
  outColor = vec4(vec3(sum), 1.0);
}

