#version 300 es
precision highp float;
precision highp sampler2D;
 
in vec2 v_texcoord;
uniform sampler2D u_texture;
uniform sampler2D u_filter;
out vec4 outColor;

vec4 get(vec2 offset){
  return texture(u_texture, (v_texcoord + offset)) * texture(u_filter, offset);
} 

void main() {
  if(v_texcoord.x > 32.0 - 4.0) discard;
  else if(v_texcoord.y > 32.0 - 4.0) discard;
  else if(mod(v_texcoord.x, 2.0) == 1.0 || mod(v_texcoord.y, 2.0) == 1.0) discard;
  else {
    vec4 sum = vec4(0.0);
    for(float y=0.0; y<4.0; y+=1.0){
      sum += get(vec2(0.0, y));
      sum += get(vec2(1.0, y));
      sum += get(vec2(2.0, y));
      sum += get(vec2(3.0, y));
    }

    outColor = sum * 0.0625; // 1/16
  }
}
