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
  out vec4 outColor;

  const int width = 32;
  const int height = 32;
  const int depth = 3;

  const mat4 f = mat4(-2.0, -1.2, -1.2, -2.0,  // First Column
                      -1.0, -0.2, -0.2, -1.0,  // Second Column
                       1.0,  0.2,  0.2,  1.0,  // Third Column
                       1.0,  0.2,  0.2,  1.0); // Fourth Column

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

  int get(vec2 offset){
    return int(texture(u_texture, (gl_FragCoord.xy + offset)));
  } 

  void main() {
    mat4 region = mat4(0.0);
    for(int row=0; row<4; row++){
      region[row] = vec4(
        get(vec2(row, 0.0)),
        get(vec2(row, 1.0)),
        get(vec2(row, 2.0)),
        get(vec2(row, 3.0))
      );
    }

    outColor = texture(u_texture, v_texcoord, 0.0);
  }
`,
};

export const process = {
  vs: `#version 300 es

  `,
  fs: `#version 300 es

  `,
};

export const output = {
  vs: `#version 300 es

  `,
  fs: `#version 300 es

  `,
};
