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
import Conv2D from './conv2d_class.js';
import './styles.css';

const downscale = {
  vs: require('./glsl/basic_vert.glsl'),
  fs: require('./glsl/downscale_frag.glsl'),
};
const downscale2 = {
  vs: require('./glsl/basic_vert.glsl'),
  fs: require('./glsl/downscale_2_frag.glsl'),
};
const upscale = {
  vs: require('./glsl/basic_vert.glsl'),
  fs: require('./glsl/upscale_frag.glsl'),
};
const upscale2 = {
  vs: require('./glsl/basic_vert.glsl'),
  fs: require('./glsl/upscale_2_frag.glsl'),
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
const DOWNSCALE_NUM_FILTERS = 2;
const DOWNSCALE2_NUM_FILTERS = 4;
const UPSCALE_NUM_FILTERS = 2;
const UPSCALE2_NUM_FILTERS = 3;
const DOWNSCALE_output_size = 16;
const DOWNSCALE2_output_size = 8;
const UPSCALE_output_size = 16;
const UPSCALE2_output_size = 32;

const __DOWNSCALE = new Conv2D(
  gl,
  {
    input: {
      size: 32,
      num_channels: 3,
      data: generateFour(),
      //data: generateImageData(32, 32, 3),
    },
    output: {
      size: 16,
      num_channels: 1,
    },
    filter: {
      num_channels: 3,
      num: 2,
      type: 'down',
    },
  },
  {
    vs: downscale.vs,
    fs: downscale.fs,
  }
);
const __DOWNSCALE_2 = new Conv2D(
  gl,
  {
    input: {
      size: 16,
      num_channels: 1,
      texture: __DOWNSCALE.output,
    },
    output: {
      size: 8,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 4,
      type: 'down',
    },
    prev: {
      num_filters: __DOWNSCALE.opts.filter.num,
    },
  },
  {
    vs: downscale2.vs,
    fs: downscale2.fs,
  }
);

const __UPSCALE = new Conv2D(
  gl,
  {
    input: {
      size: 8,
      num_channels: 1,
      texture: __DOWNSCALE_2.output,
    },
    output: {
      size: 16,
      num_channels: 1,
    },
    filter: {
      num_channels: 1,
      num: 2,
      type: 'up',
    },
    prev: {
      num_filters: __DOWNSCALE_2.opts.filter.num,
    },
  },
  {
    vs: upscale.vs,
    fs: upscale.fs,
  }
);
const __UPSCALE_2 = new Conv2D(
  gl,
  {
    input: {
      size: 16,
      num_channels: 1,
      texture: __UPSCALE.output,
    },
    output: {
      size: 32,
      num_channels: 3,
    },
    filter: {
      num_channels: 1,
      num: 3,
      type: 'output',
    },
    prev: {
      num_filters: __UPSCALE.opts.filter.num,
    },
  },
  {
    vs: upscale2.vs,
    fs: upscale2.fs,
  }
);

// UPSCALE PROGRAM --------------------------------------------------------
//const UPSCALE = createProgram(gl, upscale.vs, upscale.fs);

////UPSCALE TEXTURE: 16x16x1
//const UPSCALE_texLoc = gl.getUniformLocation(UPSCALE, 'u_texture');
//const UPSCALE_tex = gl.createTexture();
//gl.activeTexture(gl.TEXTURE0 + 0);
//gl.bindTexture(gl.TEXTURE_2D, UPSCALE_tex);
//gl.texImage2D(
//gl.TEXTURE_2D,
//0,
//gl.R8,
//DOWNSCALE2_output_size * DOWNSCALE2_NUM_FILTERS,
//DOWNSCALE2_output_size * DOWNSCALE2_NUM_FILTERS,
//0,
//gl.RED,
//gl.UNSIGNED_BYTE,
//null
//);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//const UPSCALE_filterLoc = gl.getUniformLocation(UPSCALE, 'u_filter');
//const UPSCALE_filter = gl.createTexture();
//gl.activeTexture(gl.TEXTURE0 + 1);
//gl.bindTexture(gl.TEXTURE_2D, UPSCALE_filter);
//gl.texImage2D(
//gl.TEXTURE_2D,
//0,
//gl.R8,
//4 * DOWNSCALE2_NUM_FILTERS * UPSCALE_NUM_FILTERS,
//4 * DOWNSCALE2_NUM_FILTERS * UPSCALE_NUM_FILTERS,
//0,
//gl.RED,
//gl.UNSIGNED_BYTE,
////diagFilter()
////sidesFilter()
////topBottomFilter()
////filter()
//generateImageData(
//4 * DOWNSCALE2_NUM_FILTERS * UPSCALE_NUM_FILTERS,
//4 * DOWNSCALE2_NUM_FILTERS * UPSCALE_NUM_FILTERS,
//1,
//0
//)
//);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//const UPSCALE_filter_size_loc = gl.getUniformLocation(UPSCALE, 'u_filter_size');
//const UPSCALE_filter_texel_size_loc = gl.getUniformLocation(
//UPSCALE,
//'u_filter_texel_size'
//);
//const UPSCALE_input_texel_size_loc = gl.getUniformLocation(
//UPSCALE,
//'u_input_texel_size'
//);
//const UPSCALE_num_filters_loc = gl.getUniformLocation(UPSCALE, 'u_num_filters');
//const UPSCALE_num_filters_prev_loc = gl.getUniformLocation(
//UPSCALE,
//'u_num_filters_prev'
//);
//const UPSCALE_input_size_loc = gl.getUniformLocation(UPSCALE, 'u_input_size');
//const UPSCALE_output_size_loc = gl.getUniformLocation(UPSCALE, 'u_output_size');
// ------------------------------------------------------------------------

// UPSCALE *** 2 *** PROGRAM ----------------------------------------------
const UPSCALE2 = createProgram(gl, upscale2.vs, upscale2.fs);

// UPSCALE2 TEXTURE: 16x16x1
const UPSCALE2_texLoc = gl.getUniformLocation(UPSCALE2, 'u_texture');
const UPSCALE2_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 0);
gl.bindTexture(gl.TEXTURE_2D, UPSCALE2_tex);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8,
  UPSCALE_output_size * UPSCALE_NUM_FILTERS,
  UPSCALE_output_size * UPSCALE_NUM_FILTERS,
  0,
  gl.RED,
  gl.UNSIGNED_BYTE,
  null
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const UPSCALE2_filterLoc = gl.getUniformLocation(UPSCALE2, 'u_filter');
const UPSCALE2_filter = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, UPSCALE2_filter);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.R8,
  4 * UPSCALE_NUM_FILTERS * UPSCALE2_NUM_FILTERS,
  4 * UPSCALE_NUM_FILTERS,
  0,
  gl.RED,
  gl.UNSIGNED_BYTE,
  //diagFilter()
  //sidesFilter()
  //topBottomFilter()
  //filter()
  generateImageData(
    4 * UPSCALE_NUM_FILTERS * UPSCALE2_NUM_FILTERS,
    4 * UPSCALE_NUM_FILTERS,
    1,
    0
  )
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const UPSCALE2_filter_size_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_filter_size'
);
const UPSCALE2_filter_texel_size_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_filter_texel_size'
);
const UPSCALE2_input_texel_size_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_input_texel_size'
);
const UPSCALE2_num_filters_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_num_filters'
);
const UPSCALE2_num_filters_prev_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_num_filters_prev'
);
const UPSCALE2_input_size_loc = gl.getUniformLocation(UPSCALE2, 'u_input_size');
const UPSCALE2_output_size_loc = gl.getUniformLocation(
  UPSCALE2,
  'u_output_size'
);
// ------------------------------------------------------------------------

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

// FRAMEBUFFER TEXTURES -------------------------
//const CONV2D_transpose_tex = gl.createTexture();
//gl.bindTexture(gl.TEXTURE_2D, CONV2D_transpose_tex);
//gl.texImage2D(
//gl.TEXTURE_2D,
//0,
//gl.R8,
//UPSCALE_NUM_FILTERS * UPSCALE_output_size,
//UPSCALE_NUM_FILTERS * UPSCALE_output_size,
//0,
//gl.RED,
//gl.UNSIGNED_BYTE,
//null
//);

//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//const CONV2D_2_transpose_tex = gl.createTexture();
//gl.bindTexture(gl.TEXTURE_2D, CONV2D_2_transpose_tex);
//gl.texImage2D(
//gl.TEXTURE_2D,
//0,
//gl.RGB8,
//32,
//32,
//0,
//gl.RGB,
//gl.UNSIGNED_BYTE,
//null
//);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// FRAMEBUFFERS ---------------------------------
//const UPSCALE_framebuffer = gl.createFramebuffer();
//gl.bindFramebuffer(gl.FRAMEBUFFER, UPSCALE_framebuffer);
//gl.framebufferTexture2D(
//gl.FRAMEBUFFER,
//gl.COLOR_ATTACHMENT0,
//gl.TEXTURE_2D,
//CONV2D_transpose_tex,
//0
//);
//const UPSCALE2_framebuffer = gl.createFramebuffer();
//gl.bindFramebuffer(gl.FRAMEBUFFER, UPSCALE2_framebuffer);
//gl.framebufferTexture2D(
//gl.FRAMEBUFFER,
//gl.COLOR_ATTACHMENT0,
//gl.TEXTURE_2D,
//CONV2D_2_transpose_tex,
//0
//);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

function draw(gl, process = true) {
  const start = performance.now();
  gl.bindVertexArray(OUTPUT_vao);
  __DOWNSCALE.forward();
  __DOWNSCALE_2.forward();
  __UPSCALE.forward();
  __UPSCALE_2.forward();
  //
  // UPSCALE --------------------------------------
  // Outputs to CONV2D_transpose_tex
  //gl.useProgram(__UPSCALE.program);
  ////gl.useProgram(UPSCALE);
  //gl.bindFramebuffer(gl.FRAMEBUFFER, __UPSCALE.output_fb);

  ////gl.uniform1i(UPSCALE_texLoc, 0);
  //gl.uniform1i(__UPSCALE.uniforms.input_tex, 0);
  //gl.uniform1i(__UPSCALE.uniforms.filters_tex, 0);
  ////gl.uniform1i(UPSCALE_filterLoc, 1);
  //gl.activeTexture(gl.TEXTURE0 + 0);
  //gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE_2.output);
  //gl.activeTexture(gl.TEXTURE0 + 1);
  //gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.filter);

  //gl.uniform2f(__UPSCALE.uniforms.filter_size, 4, 4);
  //gl.uniform2f(
  //__UPSCALE.uniforms.filter_texel_size,
  //1 / (4 * __UPSCALE.opts.filter.num * __UPSCALE.opts.prev.num_filters),
  //1 / (4 * __UPSCALE.opts.filter.num * __UPSCALE.opts.prev.num_filters)
  //);
  //gl.uniform2f(
  //__UPSCALE.uniforms.input_texel_size,
  //1 / (__UPSCALE.opts.prev.num_filters * __UPSCALE.opts.input.size),
  //1 / (__UPSCALE.opts.prev.num_filters * __UPSCALE.opts.input.size)
  //);
  //gl.uniform2f(
  //__UPSCALE.uniforms.num_filters,
  //__UPSCALE.opts.num_filters,
  //__UPSCALE.opts.num_filters
  //);
  //gl.uniform2f(
  //__UPSCALE.uniforms.num_filters_prev,
  //__UPSCALE.opts.prev.num_filters,
  //__UPSCALE.opts.prev.num_filters
  //);
  //gl.uniform2f(
  //__UPSCALE.uniforms.input_size,
  //__UPSCALE.opts.input.size,
  //__UPSCALE.opts.input.size
  //);
  //gl.uniform2f(
  //__UPSCALE.uniforms.output_size,
  //__UPSCALE.opts.output.size,
  //__UPSCALE.opts.output.size
  //);

  //gl.viewport(
  //0,
  //0,
  //__UPSCALE.opts.output.size * __UPSCALE.opts.filter.num,
  //__UPSCALE.opts.output.size * __UPSCALE.opts.filter.num
  //);
  //gl.clearColor(0, 0, 1, 1);
  //gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------------------------------------

  // UPSCALE *** 2 *** ----------------------------
  // Outputs to CONV2D_2_transpose_tex (32x32x3)
  //gl.useProgram(UPSCALE2);
  ////gl.bindVertexArray(UPSCALE2_vao);
  //gl.bindFramebuffer(gl.FRAMEBUFFER, UPSCALE2_framebuffer);

  //gl.uniform1i(UPSCALE2_texLoc, 0);
  //gl.uniform1i(UPSCALE2_filterLoc, 1);
  //gl.activeTexture(gl.TEXTURE0 + 0);
  //gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.output);
  //gl.activeTexture(gl.TEXTURE0 + 1);
  //gl.bindTexture(gl.TEXTURE_2D, UPSCALE2_filter);

  //gl.uniform2f(UPSCALE2_filter_size_loc, 4, 4);
  //gl.uniform2f(
  //UPSCALE2_filter_texel_size_loc,
  //1 / (4 * UPSCALE_NUM_FILTERS * UPSCALE2_NUM_FILTERS),
  //1 / (4 * UPSCALE_NUM_FILTERS)
  //);
  //gl.uniform2f(
  //UPSCALE2_input_texel_size_loc,
  //1 / (UPSCALE_NUM_FILTERS * UPSCALE_output_size),
  //1 / (UPSCALE_NUM_FILTERS * UPSCALE_output_size)
  //);
  //gl.uniform2f(UPSCALE2_num_filters_loc, UPSCALE2_NUM_FILTERS, 1);
  //gl.uniform2f(
  //UPSCALE2_num_filters_prev_loc,
  //UPSCALE_NUM_FILTERS,
  //UPSCALE_NUM_FILTERS
  //);
  //gl.uniform2f(
  //UPSCALE2_input_size_loc,
  //UPSCALE_output_size, // 16
  //UPSCALE_output_size // 16
  //);
  //gl.uniform2f(
  //UPSCALE2_output_size_loc,
  //UPSCALE2_output_size,
  //UPSCALE2_output_size
  //);

  //gl.viewport(0, 0, UPSCALE2_output_size, UPSCALE2_output_size);
  //gl.clearColor(0, 0, 1, 1);
  //gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------------------------------------

  // OUTPUT ---- DRAWING TO SCREEN ----------------
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(OUTPUT);
  //gl.bindVertexArray(OUTPUT_vao);
  gl.uniform1i(OUTPUT_texLoc, 0);
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE_2.output);
  //gl.bindTexture(gl.TEXTURE_2D, CONV2D_2_transpose_tex);
  //gl.bindTexture(gl.TEXTURE_2D, CONV2D_transpose_tex);

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
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALE *** 2 *** Filters
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE_2.filter);
  gl.viewport(filter_size, 0, filter_size, filter_size);
  gl.scissor(filter_size, 0, filter_size, filter_size);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALE Filters
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.filter);
  gl.viewport(filter_size * 2, 0, filter_size, filter_size);
  gl.scissor(filter_size * 2, 0, filter_size, filter_size);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALE *** 2 *** Filters
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE_2.filter);
  gl.viewport(
    filter_size + filter_size * __UPSCALE_2.opts.filter.num,
    0,
    filter_size * __UPSCALE_2.opts.filter.num,
    filter_size
  );
  gl.scissor(
    filter_size + filter_size * __UPSCALE_2.opts.filter.num,
    0,
    filter_size * __UPSCALE_2.opts.filter.num,
    filter_size
  );
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // INPUT
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE.input);
  //gl.bindTexture(gl.TEXTURE_2D, DOWNSCALE_tex);
  gl.viewport(0, 512 + filter_size * 2, 256, 256);
  gl.scissor(0, 512 + filter_size * 2, 256, 256);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALEd
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE.output);
  //gl.bindTexture(gl.TEXTURE_2D, CONV2D_tex);
  gl.viewport(256, 512 + filter_size * 2, 256, 256);
  gl.scissor(256, 512 + filter_size * 2, 256, 256);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // DOWNSCALEd *** 2 ***
  gl.bindTexture(gl.TEXTURE_2D, __DOWNSCALE_2.output);
  gl.viewport(512, 512 + filter_size * 2, 256, 256);
  gl.scissor(512, 512 + filter_size * 2, 256, 256);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);

  // UPSCALEd
  gl.bindTexture(gl.TEXTURE_2D, __UPSCALE.output);
  gl.viewport(512 + 256, 512 + filter_size * 2, 256, 256);
  gl.scissor(512 + 256, 512 + filter_size * 2, 256, 256);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
  // ----------------

  gl.disable(gl.SCISSOR_TEST);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  console.log(performance.now() - start);
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
