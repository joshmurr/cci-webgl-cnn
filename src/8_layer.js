import {
  createProgram,
  createTexture,
  generateFour,
  generateImageData,
  handleFileInput,
} from './functions.js';
import Conv2D from './conv2d_class.js';
import WebcamHandler from './webcam_handler.js';
import './styles.css';

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

const DOWNSCALE_input = new Conv2D(
  gl,
  {
    input: {
      size: 256,
      num_channels: 3,
      //data: generateFour(3),
      data: generateImageData(256, 256, 3),
      //texture: __DOWNSCALE_a.output,
    },
    output: {
      size: 128,
      num_channels: 1,
    },
    filter: {
      num_channels: 3,
      num: 8,
      type: 'down',
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_frag.glsl'),
  }
);

const DOWNSCALE1 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE_input.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE_input.output,
    },
    output: {
      size: DOWNSCALE_input.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 10,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE_input.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE2 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE1.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE1.output,
    },
    output: {
      size: DOWNSCALE1.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 16,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE1.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE3 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE2.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE2.output,
    },
    output: {
      size: DOWNSCALE2.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE2.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE4 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE3.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE3.output,
    },
    output: {
      size: DOWNSCALE3.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE3.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE5 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE4.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE4.output,
    },
    output: {
      size: DOWNSCALE4.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE4.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE6 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE5.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE5.output,
    },
    output: {
      size: DOWNSCALE5.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE5.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const DOWNSCALE7 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE6.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE6.output,
    },
    output: {
      size: DOWNSCALE6.opts.output.size / 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'down',
    },
    prev: {
      num_filters: DOWNSCALE6.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/downscale_2_frag.glsl'),
  }
);

const UPSCALE1 = new Conv2D(
  gl,
  {
    input: {
      size: DOWNSCALE7.opts.output.size,
      num_channels: 1,
      texture: DOWNSCALE7.output,
    },
    output: {
      size: DOWNSCALE7.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'up',
    },
    prev: {
      num_filters: DOWNSCALE7.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE2 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE1.opts.output.size,
      num_channels: 1,
      texture: UPSCALE1.output,
    },
    output: {
      size: UPSCALE1.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE1.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE3 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE2.opts.output.size,
      num_channels: 1,
      texture: UPSCALE2.output,
    },
    output: {
      size: UPSCALE2.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE2.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE4 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE3.opts.output.size,
      num_channels: 1,
      texture: UPSCALE3.output,
    },
    output: {
      size: UPSCALE3.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 22,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE3.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE5 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE4.opts.output.size,
      num_channels: 1,
      texture: UPSCALE4.output,
    },
    output: {
      size: UPSCALE4.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 16,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE4.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE6 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE5.opts.output.size,
      num_channels: 1,
      texture: UPSCALE5.output,
    },
    output: {
      size: UPSCALE5.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 10,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE5.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE7 = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE6.opts.output.size,
      num_channels: 1,
      texture: UPSCALE6.output,
    },
    output: {
      size: UPSCALE6.opts.output.size * 2,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 8,
      type: 'up',
    },
    prev: {
      num_filters: UPSCALE6.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_frag.glsl'),
  }
);

const UPSCALE_output = new Conv2D(
  gl,
  {
    input: {
      size: UPSCALE7.opts.output.size,
      num_channels: 1,
      texture: UPSCALE7.output,
    },
    output: {
      size: UPSCALE7.opts.output.size * 2,
      num_channels: 3,
    },
    filter: {
      num_channels: 3,
      num: 1,
      type: 'output',
    },
    prev: {
      num_filters: UPSCALE7.opts.filter.num,
    },
  },
  {
    vs: BASIC_VERT,
    fs: require('./glsl/upscale_2_frag.glsl'),
  }
);

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
  gl.RGB8,
  256,
  256,
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

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw() {
  const start = performance.now();

  if (webcamHandler.camActive) {
    DOWNSCALE_input.updateInputTexture(webcam);
  }

  // COMPUTATIONAL GRAPH --------------------------
  DOWNSCALE_input.forward();
  DOWNSCALE1.forward();
  DOWNSCALE2.forward();
  DOWNSCALE3.forward();
  DOWNSCALE4.forward();
  DOWNSCALE5.forward();
  DOWNSCALE6.forward();
  DOWNSCALE7.forward();
  UPSCALE1.forward();
  UPSCALE2.forward();
  UPSCALE3.forward();
  UPSCALE4.forward();
  UPSCALE5.forward();
  UPSCALE6.forward();
  UPSCALE7.forward();
  UPSCALE_output.forward();
  // ----------------------------------------------

  // OUTPUT ---- DRAWING TO SCREEN ----------------
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(OUTPUT);
  gl.uniform1i(OUTPUT_texLoc, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, UPSCALE_output.output);

  gl.enable(gl.SCISSOR_TEST);
  const filter_size = 64;
  gl.viewport(0, filter_size, 512, 512 + filter_size);
  gl.scissor(0, filter_size, 512, 512 + filter_size);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // INPUT
  gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_input.input);
  gl.viewport(0, 512 + filter_size * 2, 256, 256);
  gl.scissor(0, 512 + filter_size * 2, 256, 256);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  gl.disable(gl.SCISSOR_TEST);
  console.log(performance.now() - start);

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

gl.bindVertexArray(OUTPUT_vao);
resize(gl);
requestAnimationFrame(draw);
