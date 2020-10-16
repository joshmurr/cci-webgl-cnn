import Core from './core_class.js';

export default class Model extends Core {
  constructor(gl, opts) {
    super(gl);

    this.verts =      [-1, -1, -1, 1,  1, -1,   -1, 1, 1,  1, 1, -1]; //prettier-ignore
    this.texcoords = [ 0,  1,  0, 0,  1,  1,    0, 0, 1,  0, 1,  1]; //prettier-ignore

    this.opts = {
      input_size: 32,
      output_size: 32,
    };

    this.initInput();
    this.initOutput();
  }

  initInput() {
    const vs = require('./glsl/basic_vert.glsl');
    const fs = require('./glsl/downscale_frag.glsl');

    const input_program = this.createProgram(vs, fs);

    const input_tex_loc = this.gl.getUniformLocation(
      input_program,
      'u_texture'
    );

    const input_texture = this.createTexture({
      width: this.opts.input_size,
      height: this.opts.input_size,
      data: this.generateImageData(
        this.opts.input_size,
        this.opts.input_size,
        3
      ),
    });
  }

  initOutput() {
    const vs = require('./glsl/output_vert.glsl');
    const fs = require('./glsl/output_frag.glsl');

    const output_program = this.createProgram(vs, fs);

    this.VAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.VAO);
    const pos_attr_loc = this.gl.getAttribLocation(
      output_program,
      'a_position'
    );
    const pos_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pos_buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.verts),
      this.gl.STATIC_DRAW
    );
    this.gl.enableVertexAttribArray(pos_attr_loc);
    this.gl.vertexAttribPointer(pos_attr_loc, 2, this.gl.FLOAT, false, 0, 0);

    const texcoord_attr_loc = this.gl.getAttribLocation(
      output_program,
      'a_texcoords'
    );
    const texcoord_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoord_buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.texcoords),
      this.gl.STATIC_DRAW
    );
    this.gl.enableVertexAttribArray(texcoord_attr_loc);
    this.gl.vertexAttribPointer(
      texcoord_attr_loc,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
  }
}
