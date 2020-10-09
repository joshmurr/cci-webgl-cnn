#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
uniform vec2 u_screen_resolution;
uniform vec2 u_resolution;
out vec4 outColor;

const vec2 u_texture_texel_size = vec2(1.0/32.0);
const vec2 u_filter_texel_size = vec2(1.0/4.0);

void main(){
  //if(gl_FragCoord.y > 10.0) outColor = vec4(0.5, 0.0, 0.0, 1.0);
  outColor = texture(u_texture, v_texcoord);
  //outColor = vec4(fract(gl_FragCoord.xy/u_resolution), 0.0, 1.0);
}

