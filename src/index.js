import {
  createProgram,
  createTexture,
  generateFour,
  generateImageData,
  handleFileInput,
} from './functions.js';
import Conv2D from './conv2d_class.js';
import NP_Loader from './numpy_loader.js';
import WebcamHandler from './webcam_handler.js';
import './styles.css';
import SHOE from './sample_images/shoe.npy';
import D1 from './filters/pytorch-autoencoder/conv1.npy';
import D2 from './filters/pytorch-autoencoder/conv2.npy';
import U1 from './filters/pytorch-autoencoder/t_conv1.npy';
import U2 from './filters/pytorch-autoencoder/t_conv2.npy';
import D1_bias from './filters/pytorch-autoencoder/conv1_bias.npy';
import D2_bias from './filters/pytorch-autoencoder/conv2_bias.npy';
import U1_bias from './filters/pytorch-autoencoder/t_conv1_bias.npy';
import U2_bias from './filters/pytorch-autoencoder/t_conv2_bias.npy';

const BASIC_VERT = require('./glsl/basic_vert.glsl');

const output = {
  vs: require('./glsl/output_vert.glsl'),
  fs: require('./glsl/output_frag.glsl'),
};

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2');

if (!gl) console.error('No WebGL2 support!');

const verts =      [-1, -1, -1, 1,  1, -1,   -1, 1, 1,  1, 1, -1]; //prettier-ignore
const tex_coords = [ 0,  1,  0, 0,  1,  1,    0, 0, 1,  0, 1,  1]; //prettier-ignore

const np_loader = new NP_Loader();
const webcam = document.getElementById('video');
const webcamHandler = new WebcamHandler(webcam);

let PLAY = false;
const play_stop = {
  true: 'Stop',
  false: 'Play',
};

const buttons = document.getElementsByTagName('button');
buttons[0].addEventListener('click', (e) => webcamHandler.initCam());
buttons[1].addEventListener('click', (e) => webcamHandler.stopCam());
buttons[2].addEventListener('click', (e) => draw(gl));
buttons[3].addEventListener('click', (e) => {
  PLAY = !PLAY;
  buttons[3].innerText = play_stop[PLAY];
  draw();
});

const __DOWNSCALE = new Conv2D(
  gl,
  {
    input: {
      size: 28,
      num_channels: 1,
    },
    output: {
      size: 14,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 4,
      type: 'down',
    },
    prev: {
      num_filters: 1,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);
np_loader.load(SHOE).then((r) => {
  __DOWNSCALE.updateInputData(r);
});
np_loader.load(D1).then((r) => {
  console.group('Downscale 1');
  console.log(__DOWNSCALE.opts.filter.shape);
  console.log(r);
  console.groupEnd();
  __DOWNSCALE.updateFilterData(r);
  draw(gl);
});
np_loader.load(D1_bias).then((r) => {
  __DOWNSCALE.updateBiasData(r);
});

const __DOWNSCALE_2 = new Conv2D(
  gl,
  {
    input: {
      size: __DOWNSCALE.opts.output.size,
      num_channels: 1,
      texture: __DOWNSCALE.output,
    },
    output: {
      size: 7,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 2,
      type: 'down',
    },
    prev: {
      num_filters: __DOWNSCALE.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);
np_loader.load(D2).then((r) => {
  console.group('Downscale 2');
  console.log(__DOWNSCALE_2.opts.filter.shape);
  console.log(r);
  console.groupEnd();
  __DOWNSCALE_2.updateFilterData(r);
  draw(gl);
});
np_loader.load(D2_bias).then((r) => {
  __DOWNSCALE_2.updateBiasData(r);
});

const __UPSCALE = new Conv2D(
  gl,
  {
    input: {
      size: __DOWNSCALE_2.opts.output.size,
      num_channels: 1,
      texture: __DOWNSCALE_2.output,
    },
    output: {
      size: 14,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 4,
      type: 'up',
    },
    prev: {
      num_filters: __DOWNSCALE_2.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);
np_loader.load(U1).then((r) => {
  console.group('Upscale 1');
  console.log(__UPSCALE.opts.filter.shape);
  console.log(r);
  console.groupEnd();
  __UPSCALE.updateFilterData(r);
  draw(gl);
});
np_loader.load(U1_bias).then((r) => {
  __UPSCALE.updateBiasData(r);
});

const __UPSCALE_2 = new Conv2D(
  gl,
  {
    input: {
      size: __UPSCALE.opts.output.size,
      num_channels: 1,
      texture: __UPSCALE.output,
    },
    output: {
      size: 28,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 1,
      type: 'output',
    },
    prev: {
      num_filters: __UPSCALE.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);
np_loader.load(U2).then((r) => {
  console.group('Upscale 2');
  console.log(__UPSCALE_2.opts.filter.shape);
  console.log(r);
  console.groupEnd();
  __UPSCALE_2.updateFilterData(r);
  draw(gl);
});
np_loader.load(U2_bias).then((r) => {
  __UPSCALE_2.updateBiasData(r);
});

// OUTPUT PROGRAM --------------------------------------------------------
const OUTPUT = createProgram(gl, output.vs, output.fs);
// A generaic VAO with position and texcoord buffers used for drawing to screen
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

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw() {
  const start = performance.now();
  gl.bindVertexArray(OUTPUT_vao);

  if (webcamHandler.camActive) {
    __DOWNSCALE.updateInputTexture(webcam);
  }

  // COMPUTATIONAL GRAPH --------------------------
  __DOWNSCALE.forward();
  __DOWNSCALE_2.forward();
  //__DOWNSCALE_3.forward();
  //__UPSCALE_a.forward();
  __UPSCALE.forward();
  __UPSCALE_2.forward();
  // ----------------------------------------------

  // OUTPUT ---- DRAWING TO SCREEN ----------------
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(OUTPUT);
  gl.uniform1i(OUTPUT_texLoc, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE_2.output);
  //gl.bindTexture(gl.TEXTURE_2D, __UPSCALE_2.bias);

  gl.enable(gl.SCISSOR_TEST);
  const filter_size = 64;
  gl.viewport(0, filter_size, 512, 512 + filter_size);
  gl.scissor(0, filter_size, 512, 512 + filter_size);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALE Filters
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE.filter);
  gl.viewport(0, 0, filter_size, filter_size);
  gl.scissor(0, 0, filter_size, filter_size);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALE *** 2 *** Filters
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE_2.filter);
  gl.viewport(filter_size, 0, filter_size, filter_size);
  gl.scissor(filter_size, 0, filter_size, filter_size);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALE Filters
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.filter);
  gl.viewport(filter_size * 2, 0, filter_size, filter_size);
  gl.scissor(filter_size * 2, 0, filter_size, filter_size);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALE *** 2 *** Filters
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE_2.filter);
  gl.viewport(filter_size * 3, 0, filter_size, filter_size);
  gl.scissor(filter_size * 3, 0, filter_size, filter_size);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // INPUT
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE.input);
  gl.viewport(0, 512 + filter_size * 2, 256, 256);
  gl.scissor(0, 512 + filter_size * 2, 256, 256);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALEd
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE.output);
  gl.viewport(256, 512 + filter_size * 2, 256, 256);
  gl.scissor(256, 512 + filter_size * 2, 256, 256);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALEd *** 2 ***
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE_2.output);
  gl.viewport(512, 512 + filter_size * 2, 256, 256);
  gl.scissor(512, 512 + filter_size * 2, 256, 256);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALEd
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.output);
  gl.viewport(512 + 256, 512 + filter_size * 2, 256, 256);
  gl.scissor(512 + 256, 512 + filter_size * 2, 256, 256);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  gl.disable(gl.SCISSOR_TEST);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  //console.log(performance.now() - start);

  if (PLAY) {
    requestAnimationFrame(draw);
  }
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
requestAnimationFrame(draw);
