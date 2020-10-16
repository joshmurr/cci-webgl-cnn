import Core from './core_class.js';

export default class Conv2D extends Core {
  constructor(gl, _opts) {
    super(gl);

    this.opts = {
      input: {
        size: 32,
        num_channels: 1,
        data: null,
      },
      output: {
        size: 32,
        num_channels: 1,
      },
      filter: {
        size: 4,
        num_channels: 1,
        num: 0,
        data: null,
      },
      program: {
        vs_source: null,
        fs_source: null,
      },
    };
    Object.assign(this.opts, _opts);

    this.initProgram();
    this.initUniforms();
    this.initTextures();
  }

  initProgram() {
    this.program = this.createProgram(
      this.opts.program.vs,
      this.opts.program.fs
    );
  }

  initUniforms() {
    this.filter_size_loc = this.gl.getUniformLocation(
      this.program,
      'u_filter_size'
    );
    this.filter_texel_size_loc = this.gl.getUniformLocation(
      this.program,
      'u_filter_texel_size'
    );
    this.output_texel_size_loc = this.gl.getUniformLocation(
      this.program,
      'u_output_texel_size'
    );
    this.output_size_loc = this.gl.getUniformLocation(
      this.program,
      'u_output_size'
    );
    this.num_filters_loc = this.gl.getUniformLocation(
      this.program,
      'u_num_filters'
    );
    this.num_filters_prev_loc = this.gl.getUniformLocation(
      this.program,
      'u_num_filters_prev'
    );
  }

  initTextures() {
    let [internalFormat, format] = this.getTextureFormat(
      this.opts.filter.num_channels
    );
    this.input_tex_loc = this.gl.getUniformLocation(this.program, 'u_texture');
    this.input_tex = this.createTexture({
      width: this.opts.input.size,
      height: this.opts.input.size,
      data: this.opts.input.data
        ? this.opts.input.data
        : this.generateImageData(
            this.opts.input.size,
            this.opts.input.size,
            this.opts.input.num_channels
          ),
      internalFormat: internalFormat,
      format: format,
    });

    [internalFormat, format] = this.getTextureFormat(
      this.opts.filter.num_channels
    );
    this.filters_tex_loc = this.gl.getUniformLocation(
      this.program,
      'u_filters'
    );
    this.filter_tex = this.createTexture({
      width: this.opts.filter.size * this.opts.filter.num,
      height: this.opts.filter.size * this.opts.filter.num,
      data: this.opts.filter.data
        ? this.opts.filter.data
        : this.generateImageData(
            this.opts.filter.size * this.opts.filter.num,
            this.opts.filter.size * this.opts.filter.num,
            this.opts.filters.num_channels
          ),
      internalFormat: internalFormat,
      format: format,
    });
  }

  forward(_framebuffer) {
    this.gl.useProgram(this.program);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, _framebuffer);
    this.gl.uniform1i(this.inputs_tex_loc, 0);
    this.gl.uniform1i(this.filters_tex_loc, 1);
    this.gl.activeTexture(this.gl.TEXTURE0 + 0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.input_tex);
    this.gl.activeTexture(this.gl.TEXTURE0 + 1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.filters_tex);
    this.gl.viewport(
      0,
      0,
      this.opts.output.size * this.opts.filters.num,
      this.opts.output.size * this.opts.filters.num
    );
    this.gl.uniform2f(
      this.filter_size_loc,
      this.opts.filter.size,
      this.opts.filter.size
    );
    this.gl.uniform2f(
      this.filter_texel_size_loc,
      1 / (this.opts.filter.num * this.opts.filter.size),
      1 / (this.opts.filter.num * this.opts.filter.size)
    );
    this.gl.uniform2f(
      this.output_texel_size_loc,
      1 / this.opts.output.size,
      1 / this.opts.output.size
    );
    this.gl.uniform2f(
      this.output_size_loc,
      this.opts.output.size,
      this.opts.output.size
    );
    this.gl.uniform1f(this.num_filters_loc, this.opts.filters.num);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.verts.length / 2);
  }
}
