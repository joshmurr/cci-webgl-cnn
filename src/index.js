const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2');

if (!gl) console.error('No WebGL2 support!');

function createProgram(gl, vsSource, fsSource) {
  const shaderProgram = gl.createProgram();
  const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    return shaderProgram;
  }

  console.error('Error creating shader program!');
  gl.deleteProgram(shaderProgram);
}

function createShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw 'Could not compile WebGL program. \n\n' + info;
  }
  return shader;
}

function createTexture(idx, color) {
  // Texture
  const textureLocation = gl.getUniformLocation(program, 'u_texture');
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + idx);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    1,
    1,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    new Uint8Array([color])
  );

  //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  return texture;
}

const vsSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

const fsSource = `#version 300 es
precision highp float;
 
in vec2 v_texcoord;
uniform sampler2D u_texture;
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;

const verts = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
const tex_coords = [0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0];

const program = createProgram(gl, vsSource, fsSource);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const posAttrLoc = gl.getAttribLocation(program, 'a_position');
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(posAttrLoc);
gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
const texAttrLoc = gl.getAttribLocation(program, 'a_texcoord');
const texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texAttrLoc);
gl.vertexAttribPointer(texAttrLoc, 2, gl.FLOAT, false, 0, 0);

const texture = createTexture(0, 100);
const texture2 = createTexture(1, 30);

const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  attachmentPoint,
  gl.TEXTURE_2D,
  texture2,
  0
);

gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw(gl) {
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.viewport(0, 0, 1, 1);
  gl.clearColor(0, 0, 1, 1);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
}

draw(gl);
