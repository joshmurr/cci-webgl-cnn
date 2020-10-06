import {
  createProgram,
  createShader,
  createTexture,
  generate3DData,
  generateImageData,
} from './functions.js';
import { input, process, output } from './shaders.js';

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2');

if (!gl) console.error('No WebGL2 support!');

const verts =      [-1, -1, 1, -1, -1, 1,   -1, 1, 1, -1, 1, 1]; //prettier-ignore
const tex_coords = [ 0,  0, 0,  1,  1, 0,    1, 0, 0,  1, 1, 1]; //prettier-ignore

// INPUT PROGRAM ----------------------------------------------------------
const INPUT = createProgram(gl, input.vs, input.fs);
const INPUT_vao = gl.createVertexArray();
gl.bindVertexArray(INPUT_vao);
const INPUT_posAttrLoc = gl.getAttribLocation(INPUT, 'a_position');
const INPUT_positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, INPUT_positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(INPUT_posAttrLoc);
gl.vertexAttribPointer(INPUT_posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
const INPUT_texAttrLoc = gl.getAttribLocation(INPUT, 'a_texcoord');
const INPUT_texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, INPUT_texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(INPUT_texAttrLoc);
gl.vertexAttribPointer(INPUT_texAttrLoc, 2, gl.FLOAT, false, 0, 0);

// INPUT TEXTURE: 32x32x3
const INPUT_texLoc = gl.getUniformLocation(INPUT, 'u_texture');
const INPUT_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, INPUT_tex);
gl.texImage2D(
  // Replace with texStorage() ????
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  32,
  32,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  generateImageData(32, 32, 3)
);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

const INPUT_filterLoc = gl.getUniformLocation(INPUT, 'u_filter');
const INPUT_filter = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, INPUT_filter);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  4,
  4,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  generateImageData(4, 4, 3)
);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// PROCESS PROGRAM --------------------------------------------------------
const PROCESS = createProgram(gl, process.vs, process.fs);
const PROCESS_vao = gl.createVertexArray();
gl.bindVertexArray(PROCESS_vao);
const PROCESS_posAttrLoc = gl.getAttribLocation(PROCESS, 'a_position');
const PROCESS_positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, PROCESS_positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(PROCESS_posAttrLoc);
gl.vertexAttribPointer(PROCESS_posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
const PROCESS_texAttrLoc = gl.getAttribLocation(PROCESS, 'a_texcoord');
const PROCESS_texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, PROCESS_texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(PROCESS_texAttrLoc);
gl.vertexAttribPointer(PROCESS_texAttrLoc, 2, gl.FLOAT, false, 0, 0);

// PROCESS TEXTURE: 16x16x1
const PROCESS_texLoc = gl.getUniformLocation(PROCESS, 'u_texture');
const PROCESS_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, PROCESS_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  16 * 1,
  16,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  null
);
//gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const CONV_tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, CONV_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  16 * 1,
  16,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  null
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  CONV_tex,
  0
);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw(gl) {
  // INPUT ----------
  gl.useProgram(INPUT);
  gl.bindVertexArray(INPUT_vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.uniform1i(INPUT_texLoc, 0);
  gl.uniform1i(INPUT_filterLoc, 1);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, INPUT_tex);
  gl.activeTexture(gl.TEXTURE0 + 1);
  gl.bindTexture(gl.TEXTURE_2D, INPUT_filter);

  gl.viewport(0, 0, 16, 16);
  gl.clearColor(0, 0, 1, 1);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // PROCESS --------
  gl.useProgram(PROCESS);
  gl.bindVertexArray(PROCESS_vao);

  gl.uniform1i(PROCESS_texLoc, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, CONV_tex);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
}

draw(gl);
