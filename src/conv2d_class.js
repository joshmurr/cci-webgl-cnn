import Core from './core_class.js';

export default class Conv2D extends Core {
  constructor(gl, _opts, _program) {
    super(gl);

    this.program = this.createProgram(_program.vs, _program.fs);

    this.opts = {
      input: {
        size: 32,
        num_channels: 1,
        data: null,
        texture: null,
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
      prev_layer: {
        num_filters: 1,
      },
    };
    this.uniforms = {
      // Textures
      input_tex: this.gl.getUniformLocation(this.program, 'u_texture'),
      filters_tex: this.gl.getUniformLocation(this.program, 'u_filter'),
      //
      texel_size: this.gl.getUniformLocation(
        this.program,
        'u_filter_texel_size'
      ),
      output_texel_size: this.gl.getUniformLocation(
        this.program,
        'u_output_texel_size'
      ),
      input_texel_size: this.gl.getUniformLocation(
        this.program,
        'u_input_texel_size'
      ),
      input_size: this.gl.getUniformLocation(this.program, 'u_input_size'),
      output_size: this.gl.getUniformLocation(this.program, 'u_output_size'),
      num_filters: this.gl.getUniformLocation(this.program, 'u_num_filters'),
      num_filters_prev: this.gl.getUniformLocation(
        this.program,
        'u_num_filters_prev'
      ),
    };
    for (const prop in this.opts) {
      Object.assign(this.opts[prop], _opts[prop]);
    }

    this.initTextures();
    this.output_fb = this.createFramebuffer(this.output_tex);
  }

  initTextures() {
    // INPUT --------------------------------------------
    let [internalFormat, format] = this.getTextureFormat(
      this.opts.input.num_channels
    );
    this.input_tex = this.createTexture({
      width: this.opts.input.size * this.opts.prev_layer.num_filters,
      height: this.opts.input.size * this.opts.prev_layer.num_filters,
      data: this.opts.input.data,
      internalFormat: internalFormat,
      format: format,
    });

    // FILTERS ------------------------------------------
    [internalFormat, format] = this.getTextureFormat(
      this.opts.filter.num_channels
    );
    this.filters_tex = this.createTexture({
      width: this.opts.filter.size * this.opts.filter.num,
      height: this.opts.filter.size * this.opts.filter.num,
      data: this.opts.filter.data
        ? this.opts.filter.data
        : this.generateImageData(
            this.opts.filter.size * this.opts.filter.num,
            this.opts.filter.size * this.opts.filter.num,
            this.opts.filter.num_channels
          ),
      internalFormat: internalFormat,
      format: format,
    });

    // OUTPUT -------------------------------------------
    [internalFormat, format] = this.getTextureFormat(
      this.opts.output.num_channels
    );
    this.output_tex = this.createTexture({
      width: this.opts.output.size * this.opts.filter.num,
      height: this.opts.output.size * this.opts.filter.num,
      data: null,
      internalFormat: internalFormat,
      format: format,
    });
  }

  get input() {
    return this.input_tex;
  }

  get output() {
    return this.output_tex;
  }

  forward(_fb) {
    this.gl.useProgram(this.program);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, _fb ? _fb : this.output_fb);

    this.gl.uniform1i(this.uniforms.input_tex, 0);
    this.gl.uniform1i(this.uniforms.filters_tex, 1);
    this.gl.activeTexture(this.gl.TEXTURE0 + 0);
    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.opts.input.texture ? this.opts.input.texture : this.input_tex
    );
    this.gl.activeTexture(this.gl.TEXTURE0 + 1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.filters_tex);
    this.gl.viewport(
      0,
      0,
      this.opts.output.size * this.opts.filter.num,
      this.opts.output.size * this.opts.filter.num
    );

    this.gl.uniform2f(
      this.uniforms.filter_texel_size,
      1 / (this.opts.filter.num * this.opts.filter.size),
      1 / (this.opts.filter.num * this.opts.filter.size)
    );
    this.gl.uniform2f(
      this.uniforms.input_texel_size,
      1 / (this.opts.input.size * this.opts.prev_layer.num_filters),
      1 / (this.opts.input.size * this.opts.prev_layer.num_filters)
    );
    this.gl.uniform2f(
      this.uniforms.output_texel_size,
      1 / (this.opts.output.size * this.opts.filter.num),
      1 / (this.opts.output.size * this.opts.filter.num)
    );
    this.gl.uniform2f(
      this.uniforms.input_size,
      this.opts.input.size,
      this.opts.input.size
    );
    this.gl.uniform2f(
      this.uniforms.output_size,
      this.opts.output.size,
      this.opts.output.size
    );
    this.gl.uniform2f(
      this.uniforms.num_filters_prev,
      this.opts.prev_layer.num_filters,
      this.opts.prev_layer.num_filters
    );
    this.gl.uniform2f(
      this.uniforms.num_filters,
      this.opts.filter.num,
      this.opts.filter.num
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.verts.length / 2);
  }
}
