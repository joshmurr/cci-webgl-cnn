#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
out vec4 outColor;

void main(){
  outColor = texture(u_texture, v_texcoord);
}

