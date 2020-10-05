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

const INPUT = createProgram(gl, input.vs, input.fs);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const posAttrLoc = gl.getAttribLocation(INPUT, 'a_position');
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(posAttrLoc);
gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
const texAttrLoc = gl.getAttribLocation(INPUT, 'a_texcoord');
const texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texAttrLoc);
gl.vertexAttribPointer(texAttrLoc, 2, gl.FLOAT, false, 0, 0);

// INPUT TEXTURE: 32x32x3
const inputTexLoc = gl.getUniformLocation(INPUT, 'u_texture');
const inputTex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, inputTex);
gl.texImage2D(
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
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//const fb = gl.createFramebuffer();
//gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
//const attachmentPoint = gl.COLOR_ATTACHMENT0;
//gl.framebufferTexture2D(
//gl.FRAMEBUFFER,
//attachmentPoint,
//gl.TEXTURE_2D,
//texture2,
//0
//);

gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw(gl) {
  gl.useProgram(INPUT);
  gl.bindVertexArray(vao);
  //gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  //gl.bindTexture(gl.TEXTURE_2D, texture);
  //gl.viewport(0, 0, 1, 1);
  //gl.clearColor(0, 0, 1, 1);
  //gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, inputTex);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
}

draw(gl);
