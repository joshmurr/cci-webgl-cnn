#version 300 es
precision highp float;
precision highp sampler2D;
 
in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
out vec4 outColor;
//out float outColor;
const float texel_size = 1.0 / 32.0;
const float texel_half = texel_size/2.0;
const float filter_texel_size = 1.0 / 4.0;

vec3 get(vec2 offset){
  return texture(u_texture, (gl_FragCoord.xy + offset)/16.0).rgb// * vec2(texel_size))).rgb;
       * ((texture(u_filter, offset).rgb * 2.0) - 1.0);
} 

void main() {
  //if(v_texcoord.x > 1.0 - 4.0*texel_size) discard;
  //else if(v_texcoord.y > 1.0 - 4.0*texel_size) discard;
  //if(mod(v_texcoord.x, texel_size) == 1.0 || mod(v_texcoord.y, texel_size) == 1.0) discard;
  if(mod(gl_FragCoord.x, 2.0) == 1.0 || mod(gl_FragCoord.y, 2.0) == 1.0) discard;
  else {
    vec3 sum_row = vec3(0.0);
    for(float y=0.0; y<4.0; y+=1.0){
      sum_row += get(vec2(0.0, y));
      sum_row += get(vec2(1.0, y));
      sum_row += get(vec2(2.0, y));
      sum_row += get(vec2(3.0, y));
    }

    float sum = dot(sum_row * 0.0625, vec3(1.0)) * 0.333; // Sum vector components and average.

    //if(v_texcoord.y > 0.5) outColor = vec4(vec3(0.8, 0.0, 0.0), 1.0);
    outColor = vec4(vec3(sum), 1.0); //sum_row * 0.0625;
    //outColor = vec4(vec3(sum * 0.0625), 1.0); // 1/16
    //outColor = sum;
    //outColor = texture(u_texture, v_texcoord);
  }
}
