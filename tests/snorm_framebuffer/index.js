const gl = document.getElementsByTagName('canvas')[0].getContext('webgl2');

const vs = `#version 300 es
  in vec4 a_position;
  in vec2 a_texcoord;
  out vec2 v_texcoord;

  void main(){
    gl_Position = a_position;
    v_texcoord = a_texcoord;
  }
`;
const fs = `#version 300 es
  precision mediump float;
  precision mediump sampler2D;

  in vec2 v_texcoord;
  uniform sampler2D u_texture;
  out vec4 outcolor;

  void main(){
    outcolor = texture(u_texture, v_texcoord);
  }
`;

// SETUP SHADER PROGRAM --------------------------------
const v_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(v_shader, vs);
gl.compileShader(v_shader);
const f_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(f_shader, fs);
gl.compileShader(f_shader);

const program = gl.createProgram();
gl.attachShader(program, v_shader);
gl.attachShader(program, f_shader);
gl.linkProgram(program);
// -----------------------------------------------------

// POSITION BUFFER -------------------------------------
const pos_attr = gl.getAttribLocation(program, 'a_position');
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, -1, 1, 1, -1, -1, 1, 1, 1, 1, -1]),
  gl.STATIC_DRAW
);

gl.enableVertexAttribArray(pos_attr);
gl.vertexAttribPointer(pos_attr, 2, gl.FLOAT, false, 0, 0);
// -----------------------------------------------------

// TEXCOORD BUFFER -------------------------------------
const texcoord_attr = gl.getAttribLocation(program, 'a_texcoord');
const texcoord_buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoord_buf);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0]),
  gl.STATIC_DRAW
);
gl.enableVertexAttribArray(texcoord_attr);
gl.vertexAttribPointer(texcoord_attr, 2, gl.FLOAT, false, 0, 0);
// -----------------------------------------------------

// TEXTURE ---------------------------------------------
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8_SNORM,
  4,
  2,
  0,
  gl.RED,
  gl.BYTE,
  new Int8Array([0, 42, 85, 127, 128, 170, 212, 255])
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// -----------------------------------------------------

// FRAMEBUFFER -----------------------------------------
const fb_tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, fb_tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8_SNORM, 4, 2, 0, gl.RED, gl.BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  fb_tex,
  0
);
// -----------------------------------------------------

const framebufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
console.log(framebufferStatus === gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT);

gl.useProgram(program);
gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

gl.viewport(0, 0, 4, 2);
gl.clearColor(0.1, 0.2, 0.5, 1.0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.drawArrays(gl.TRIANGLES, 0, 6);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, fb_tex);
gl.drawArrays(gl.TRIANGLES, 0, 6);
