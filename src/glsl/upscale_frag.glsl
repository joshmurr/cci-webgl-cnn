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

vec3 get(vec2 _st, vec2 _filter_offset, vec2 _offset){
  return texture(u_texture, _st + _offset * u_input_texel_size).rrr
        *(texture(u_filter, (_filter_offset + _offset) * u_filter_texel_size).rrr) * 2.0 - vec3(1.0);
  //* texture(u_filter, 
  //return vec3(1.0);
} 

void main(){
  // Input tex:  16*NUM_FILTERS x 16*NUM_FILTERS x 1
  // Output tex: 32 x 32 x 3
  vec2 st = gl_FragCoord.xy / u_output_size;
  vec2 input_st = st / u_num_filters_prev;
  vec2 filter_offset = floor(gl_FragCoord.xy / u_input_size); // (2,2)

  float output_channels[3];

  vec2 secondary_filter_offset = vec2(0.0);
  for(int c=0; c<3; c++){

    vec3 sum_filters = vec3(0.0);
    for(float f_x=0.0, inc=1.0/u_num_filters_prev.x; f_x<1.0; f_x+=inc){
      for(float f_y=0.0, inc=1.0/u_num_filters_prev.y; f_y<1.0; f_y+=inc){
        vec2 offset_st = input_st + vec2(f_x, f_y);
        // DO FILTER 4x4 ROUTINE
        vec3 sum_row = vec3(0.0);
        for(float y=0.0; y<4.0; y+=1.0){
          sum_row += get(offset_st, filter_offset + secondary_filter_offset, vec2(0.0, y));
          sum_row += get(offset_st, filter_offset + secondary_filter_offset, vec2(1.0, y));
          sum_row += get(offset_st, filter_offset + secondary_filter_offset, vec2(2.0, y));
          sum_row += get(offset_st, filter_offset + secondary_filter_offset, vec2(3.0, y));
        }
        sum_filters += sum_row;
      }
    }
    float sum = dot(sum_filters / (u_num_filters_prev.x * u_num_filters_prev.y *u_filter_size.x * u_filter_size.y), vec3(1.0)) * 0.333;
    output_channels[c] = sum;

    secondary_filter_offset.x += 2.0;
  }
  // Used to prove output is higher res that input.
  //if(floor(mod(gl_FragCoord.x, 2.0)) == 1.0) discard;

  // Sum vector components and average.
  outColor = vec4(vec3(output_channels[0], output_channels[1], output_channels[2]), 1.0);
}

