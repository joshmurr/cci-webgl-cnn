#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_texcoord;
uniform sampler2D u_texture; // 16x16x3
uniform sampler2D u_filter;  // 4x4x3
const vec2 texel_size = vec2(1.0/32.0);
const vec2 filter_texel_size = vec2(1.0/4.0);
out vec4 outColor;

vec3 get(vec2 offset){
  return texture(u_texture, v_texcoord + offset*texel_size).rrr
       * (((texture(u_filter, (offset + vec2(1.5))*filter_texel_size).rgb) * 2.0) -vec3(1.0)); // Mapped to [-1, 1]
} 

void main(){
  vec3 sum_row = vec3(0.0);
  for(float y=-1.5; y<2.0; y+=1.0){
    sum_row += get(vec2(-1.5, y));
    sum_row += get(vec2(-0.5, y));
    sum_row += get(vec2(0.5,  y));
    sum_row += get(vec2(1.5,  y));
  }

  float sum = dot(sum_row * 0.0625, vec3(1.0)) * 0.333; // Sum vector components and average.
  outColor = vec4(vec3(sum), 1.0);
}

