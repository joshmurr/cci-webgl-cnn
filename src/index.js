import {
  createProgram,
  createShader,
  createTexture,
  generateGradient,
  generateImageData,
  generateLine,
  generateFour,
  filter,
  diagFilter,
  diagFilterOpp,
  sidesFilter,
  topBottomFilter,
} from './functions.js';
import './styles.css';

const downscale = {
  vs: require('./glsl/downscale_vert.glsl'),
  fs: require('./glsl/downscale_frag.glsl'),
};
const upscale = {
  vs: require('./glsl/upscale_vert.glsl'),
  fs: require('./glsl/upscale_frag.glsl'),
};
const output = {
  vs: require('./glsl/output_vert.glsl'),
  fs: require('./glsl/output_frag.glsl'),
};

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2');

if (!gl) console.error('No WebGL2 support!');

const verts =      [-1, -1, -1, 1,  1, -1,   -1, 1, 1,  1, 1, -1]; //prettier-ignore
const tex_coords = [ 0,  1,  0, 0,  1,  1,    0, 0, 1,  0, 1,  1]; //prettier-ignore
const NUM_FILTERS = 8;
const DOWNSCALE_output_size = 16;

// DOWNSCALE PROGRAM ----------------------------------------------------------
const DOWNSCALE = createProgram(gl, downscale.vs, downscale.fs);
const DOWNSCALE_vao = gl.createVertexArray();
gl.bindVertexArray(DOWNSCALE_vao);
const DOWNSCALE_posAttrLoc = gl.getAttribLocation(DOWNSCALE, 'a_position');
const DOWNSCALE_positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, DOWNSCALE_positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(DOWNSCALE_posAttrLoc);
gl.vertexAttribPointer(DOWNSCALE_posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
//const DOWNSCALE_texattrloc = gl.getAttribLocation(DOWNSCALE, 'a_texcoord');
//const DOWNSCALE_texbuffer = gl.createBuffer();
//gl.bindBuffer(gl.ARRAY_BUFFER, DOWNSCALE_texbuffer);
//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
//gl.enableVertexAttribArray(DOWNSCALE_texattrloc);
//gl.vertexAttribPointer(DOWNSCALE_texattrloc, 2, gl.FLOAT, false, 0, 0);

// DOWNSCALE TEXTURE: 32x32x3
const DOWNSCALE_texLoc = gl.getUniformLocation(DOWNSCALE, 'u_texture');
const DOWNSCALE_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_tex);
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
  //generateImageData(32, 32, 3)
  //generateGradient(32, 32, 3)
  //generateLine(32, 32, 3)
  generateFour()
);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const DOWNSCALE_filterLoc = gl.getUniformLocation(DOWNSCALE, 'u_filter');
const DOWNSCALE_filter = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_filter);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  4 * NUM_FILTERS,
  4 * NUM_FILTERS,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  //diagFilter()
  //sidesFilter()
  //topBottomFilter()
  //filter()
  generateImageData(4 * NUM_FILTERS, 4 * NUM_FILTERS, 3, 0)
);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const DOWNSCALE_filter_size_loc = gl.getUniformLocation(
  DOWNSCALE,
  'u_filter_size'
);
const DOWNSCALE_filter_texel_size_loc = gl.getUniformLocation(
  DOWNSCALE,
  'u_filter_texel_size'
);
const DOWNSCALE_input_texel_size_loc = gl.getUniformLocation(
  DOWNSCALE,
  'u_input_texture_size'
);
const DOWNSCALE_output_size_loc = gl.getUniformLocation(
  DOWNSCALE,
  'u_output_size'
);

// UPSCALE PROGRAM --------------------------------------------------------
const UPSCALE = createProgram(gl, upscale.vs, upscale.fs);
const UPSCALE_vao = gl.createVertexArray();
gl.bindVertexArray(UPSCALE_vao);
const UPSCALE_posAttrLoc = gl.getAttribLocation(UPSCALE, 'a_position');
const UPSCALE_positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, UPSCALE_positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(UPSCALE_posAttrLoc);
gl.vertexAttribPointer(UPSCALE_posAttrLoc, 2, gl.FLOAT, false, 0, 0);

// Texture Coords
const UPSCALE_texAttrLoc = gl.getAttribLocation(UPSCALE, 'a_texcoord');
const UPSCALE_texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, UPSCALE_texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(UPSCALE_texAttrLoc);
gl.vertexAttribPointer(UPSCALE_texAttrLoc, 2, gl.FLOAT, false, 0, 0);

// UPSCALE TEXTURE: 16x16x1
const UPSCALE_texLoc = gl.getUniformLocation(UPSCALE, 'u_texture');
const UPSCALE_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, UPSCALE_tex);
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

const UPSCALE_filterLoc = gl.getUniformLocation(UPSCALE, 'u_filter');
const UPSCALE_filter = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, UPSCALE_filter);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB8,
  4,
  4,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  //diagFilter()
  //sidesFilter()
  //topBottomFilter()
  filter()
  //generateImageData(4, 4, 3)
);
gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// OUTPUT PROGRAM --------------------------------------------------------
const OUTPUT = createProgram(gl, output.vs, output.fs);
const OUTPUT_vao = gl.createVertexArray();
gl.bindVertexArray(OUTPUT_vao);
const OUTPUT_posAttrLoc = gl.getAttribLocation(OUTPUT, 'a_position');
const OUTPUT_positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, OUTPUT_positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.enableVertexAttribArray(OUTPUT_posAttrLoc);
gl.vertexAttribPointer(OUTPUT_posAttrLoc, 2, gl.FLOAT, false, 0, 0);

const OUTPUT_resolutionLoc = gl.getUniformLocation(OUTPUT, 'u_resolution');
const OUTPUT_screen_resolutionLoc = gl.getUniformLocation(
  OUTPUT,
  'u_screen_resolution'
);

// Texture Coords
const OUTPUT_texAttrLoc = gl.getAttribLocation(OUTPUT, 'a_texcoord');
const OUTPUT_texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, OUTPUT_texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);
gl.enableVertexAttribArray(OUTPUT_texAttrLoc);
gl.vertexAttribPointer(OUTPUT_texAttrLoc, 2, gl.FLOAT, false, 0, 0);

// OUTPUT TEXTURE: 32x32x3
const OUTPUT_texLoc = gl.getUniformLocation(OUTPUT, 'u_texture');
const OUTPUT_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, OUTPUT_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8,
  32,
  32,
  0,
  gl.RED,
  gl.UNSIGNED_BYTE,
  null
);
//gl.generateMipmap(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// FRAMEBUFFER TEXTURES -------------------------
const CONV2D_tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, CONV2D_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8,
  DOWNSCALE_output_size * NUM_FILTERS,
  DOWNSCALE_output_size * NUM_FILTERS,
  0,
  gl.RED,
  gl.UNSIGNED_BYTE,
  null
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

const CONV2D_transpose_tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, CONV2D_transpose_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8,
  32,
  32,
  0,
  gl.RED,
  gl.UNSIGNED_BYTE,
  null
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// FRAMEBUFFERS ---------------------------------
const DOWNSCALE_framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, DOWNSCALE_framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  CONV2D_tex,
  0
);
const UPSCALE_framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, UPSCALE_framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  CONV2D_transpose_tex,
  0
);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw(gl, process = true) {
  // DOWNSCALE ----------
  gl.useProgram(DOWNSCALE);
  gl.bindVertexArray(DOWNSCALE_vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, DOWNSCALE_framebuffer);

  gl.uniform1i(DOWNSCALE_texLoc, 0);
  gl.uniform1i(DOWNSCALE_filterLoc, 1);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_tex);
  gl.activeTexture(gl.TEXTURE0 + 1);
  gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_filter);

  gl.viewport(
    0,
    0,
    DOWNSCALE_output_size * NUM_FILTERS,
    DOWNSCALE_output_size * NUM_FILTERS
  );

  gl.uniform2f(DOWNSCALE_filter_size_loc, 4, 4);
  gl.uniform2f(
    DOWNSCALE_filter_texel_size_loc,
    1 / (4 * NUM_FILTERS),
    1 / (4 * NUM_FILTERS)
  );
  gl.uniform2f(DOWNSCALE_input_texel_size_loc, 1 / 32, 1 / 32);
  gl.uniform2f(DOWNSCALE_output_size_loc, 16, 16);

  gl.clearColor(0, 0, 1, 1);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  // UPSCALE --------
  gl.useProgram(UPSCALE);
  gl.bindVertexArray(UPSCALE_vao);
  gl.bindFramebuffer(gl.FRAMEBUFFER, UPSCALE_framebuffer);

  gl.uniform1i(UPSCALE_texLoc, 0);
  gl.uniform1i(UPSCALE_filterLoc, 1);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, CONV2D_tex);
  gl.activeTexture(gl.TEXTURE0 + 1);
  gl.bindTexture(gl.TEXTURE_2D, UPSCALE_filter);

  gl.viewport(0, 0, 32, 32);
  gl.clearColor(0, 0, 1, 1);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  // OUTPUT ---------
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(OUTPUT);
  gl.bindVertexArray(OUTPUT_vao);
  gl.uniform1i(OUTPUT_texLoc, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  //gl.bindTexture(gl.TEXTURE_2D, CONV2D_transpose_tex);
  gl.bindTexture(gl.TEXTURE_2D, CONV2D_tex);

  gl.enable(gl.SCISSOR_TEST);
  const filter_size = 32;
  gl.viewport(0, filter_size, 512, 512 + filter_size);
  gl.scissor(0, filter_size, 512, 512 + filter_size);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_filter);
  gl.viewport(0, 0, filter_size, filter_size);
  gl.scissor(0, 0, filter_size, filter_size);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // ----------------

  gl.disable(gl.SCISSOR_TEST);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function resize(gl) {
  // https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  var realToCSSPixels = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
  var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

  // Check if the canvas is not the same size.
  if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
    // Make the canvas the same size
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  }
}

resize(gl);
draw(gl, true);
