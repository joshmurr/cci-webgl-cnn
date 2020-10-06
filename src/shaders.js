export const input = {
  vs: `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;

  out vec2 v_texcoord;

  void main() {
    gl_Position = a_position;
    v_texcoord = a_texcoord;
  }
  `,

  fs: `#version 300 es
  precision highp float;
  precision highp sampler2D;
   
  in vec2 v_texcoord;
  uniform sampler2D u_texture;
  uniform sampler2D u_filter;
  out vec4 outColor;

  float convolve(mat4 region, mat4 f){
    mat4 res = matrixCompMult(region, f);
    float sum = 0.0;
    for(int i=0; i<4; i++){
      sum += res[i].x;
      sum += res[i].y;
      sum += res[i].z;
      sum += res[i].w;
    }
    return sum;
  }

  vec4 get(vec2 offset){
    return texture(u_texture, (v_texcoord + offset));// * texture(u_filter, offset);
  } 

  void main() {
    if(mod(v_texcoord.x, 2.0) == 1.0 || mod(v_texcoord.y, 2.0) == 1.0) discard;
    if(v_texcoord.x > 32.0 - 4.0) discard;
    if(v_texcoord.y > 32.0 - 4.0) discard;

    vec4 sum = vec4(0.0);
    for(float y=0.0; y<4.0; y+=1.0){
      sum += get(vec2(0.0, y));
      sum += get(vec2(1.0, y));
      sum += get(vec2(2.0, y));
      sum += get(vec2(3.0, y));
    }

    outColor = sum * 0.0625; // 1/16
  }
`,
};

export const process = {
  vs: `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;

  out vec2 v_texcoord;

  void main() {
    gl_Position = a_position;
    v_texcoord = a_texcoord;
  }

  `,
  fs: `#version 300 es
  precision highp float;
  precision highp sampler2D;

  in vec2 v_texcoord;
  uniform sampler2D u_texture;
  out vec4 outColor;

  void main(){
    outColor = texture(u_texture, v_texcoord);
  }

  `,
};

export const output = {
  vs: `#version 300 es

  `,
  fs: `#version 300 es

  `,
};
