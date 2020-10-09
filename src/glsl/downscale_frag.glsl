#version 300 es
precision highp float;
precision highp sampler2D;
 
in vec2 v_texcoord;
uniform sampler2D u_texture; // 32x32x3
uniform sampler2D u_filter;  // 4x4x3
out vec4 outColor;
const vec2 texel_size = vec2(1.0/16.0);
const vec2 filter_texel_size = vec2(1.0/4.0);

vec3 get(vec2 offset){
  return texture(u_texture, v_texcoord + offset*texel_size).rgb
       * (((texture(u_filter, (offset + vec2(1.5))*filter_texel_size).rgb) * 2.0) -vec3(1.0)); // Mapped to [-1, 1]
} 

void main() {
  //if(gl_FragCoord.x > 16.0 - 2.0) discard;
  //else if(gl_FragCoord.y > 16.0 - 2.0) discard;
  //if(mod(v_texcoord.x, texel_size) == 1.0 || mod(v_texcoord.y, texel_size) == 1.0) discard;
  //else if(mod(gl_FragCoord.x, 2.0) == 1.0 || mod(gl_FragCoord.y, 2.0) == 1.0) discard;
  {
    vec3 sum_row = vec3(0.0);
    for(float y=-1.5; y<2.0; y+=1.0){
      sum_row += get(vec2(-1.5, y));
      sum_row += get(vec2(-0.5, y));
      sum_row += get(vec2(0.5, y) );
      sum_row += get(vec2(1.5, y) );
    }

    float sum = dot(sum_row * 0.0625, vec3(1.0)) * 0.333; // Sum vector components and average.

    //if(gl_FragCoord.y > 8.0) outColor = vec4(vec3(0.5), 1.0);
    outColor = vec4(vec3(sum), 1.0); //sum_row * 0.0625;
    //outColor = texture(u_filter, v_texcoord);
    //bvec2 test = lessThan(v_texcoord, vec2(31.0*texel_size));
    //if(test.x && test.y) outColor = vec4(1.0, 0.0, 0.0, 1.0);
    //outColor = mix(vec4(1.0, 0.0, 0.0, 1.0), texture(u_texture, v_texcoord), outColor);
    //outColor = mix( texture(u_texture, v_texcoord),vec4(1.0, 0.0, 0.0, 1.0), outColor);


  }
}
