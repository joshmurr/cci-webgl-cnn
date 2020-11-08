import Core from './core_class.js';

export default class Conv2D extends Core {
  constructor(gl, _opts, _program) {
    super(gl);

    this.program = this.createProgram(_program.vs, _program.fs);

    // Default options:
    this.opts = {
      input: {
        size: 1,
        num_channels: 1,
        data: null,
        texture: null,
      },
      output: {
        size: 1,
        num_channels: 1,
      },
      filter: {
        size: 4,
        num_channels: 1,
        num: 0,
        data: null,
        type: 'down',
        shape: {
          w: null,
          h: null,
        },
      },
      prev: {
        num_filters: 1,
      },
    };
    // Copy options passed to object
    for (const prop in this.opts) {
      Object.assign(this.opts[prop], _opts[prop]);
    }

    this.uniforms = {
      // Textures
      input_tex: this.gl.getUniformLocation(this.program, 'u_texture'),
      filters_tex: this.gl.getUniformLocation(this.program, 'u_filter'),
      bias_tex: this.gl.getUniformLocation(this.program, 'u_bias'),
      //filters_smask: this.gl.getUniformLocation(this.program, 'u_filter_smask'),
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

    this.initTextures();
    this.output_fb = this.createFramebuffer(this.output_tex);
  }

  initTextures() {
    // INPUT --------------------------------------------
    let { internalFormat, format } = this.getTextureFormat(
      this.opts.input.num_channels
    );
    this.input_tex = this.createTexture({
      width: this.opts.input.size * this.opts.prev.num_filters,
      height: this.opts.input.size * this.opts.prev.num_filters,
      data: this.opts.input.data,
      internalFormat: this.gl[internalFormat],
      format: this.gl[format],
    });

    // FILTERS ------------------------------------------
    ({ internalFormat, format } = this.getTextureFormat(
      this.opts.filter.num_channels
    ));
    this.opts.filter.shape = this.getFilterShape(this.opts.filter.type);
    this.filters_tex = this.createTexture({
      width: this.opts.filter.shape.w,
      height: this.opts.filter.shape.h,
      data: this.opts.filter.data
        ? this.opts.filter.data
        : this.generateImageData(
            this.opts.filter.shape.w,
            this.opts.filter.shape.h,
            this.opts.filter.num_channels,
            100
          ),
      internalFormat: this.gl[internalFormat],
      format: this.gl[format],
    });

    // BIASES ------------------------------------------
    this.bias_tex = this.createTexture({
      width: this.opts.filter.num,
      height: this.opts.filter.num,
      data: null,
      internalFormat: this.gl.R32F,
      format: this.gl.RED,
      dataType: this.gl.FLOAT,
    });

    // OUTPUT -------------------------------------------
    ({ internalFormat, format } = this.getTextureFormat(
      this.opts.output.num_channels
    ));
    this.output_tex = this.createTexture({
      width: this.opts.output.size * this.opts.filter.num,
      height: this.opts.output.size * this.opts.filter.num,
      data: null,
      internalFormat: this.gl[internalFormat],
      format: this.gl[format],
    });
  }

  updateFilterData(_data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.filters_tex);
    const { internalFormat, format } = this.getTextureFormat(
      this.opts.filter.num_channels
    );

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.R32F,
      this.opts.filter.shape.w,
      this.opts.filter.shape.h,
      0,
      this.gl.RED,
      this.gl.FLOAT,
      _data.data
    );
  }

  updateInputData(_data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.input_tex);
    const { internalFormat, format } = this.getTextureFormat(
      this.opts.input.num_channels
    );

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.R32F,
      this.opts.input.size,
      this.opts.input.size,
      0,
      this.gl.RED,
      this.gl.FLOAT,
      _data.data
    );
  }

  updateInputTexture(_elem) {
    const { internalFormat, format } = this.getTextureFormat(
      this.opts.input.num_channels
    );
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.input_tex);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl[internalFormat],
      this.opts.input.size,
      this.opts.input.size,
      0,
      this.gl[format],
      this.gl.UNSIGNED_BYTE,
      _elem
    );
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  updateBiasData(_data) {
    console.log(_data.data);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.bias_tex);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.R32F,
      this.opts.filter.num,
      this.opts.filter.num,
      0,
      this.gl.RED,
      this.gl.FLOAT,
      _data.data
    );
  }

  getFilterShape(_type) {
    let w, h;
    switch (_type) {
      case 'down':
        w = h =
          this.opts.filter.size *
          this.opts.filter.num *
          this.opts.prev.num_filters;
        return { w: w, h: h };
      case 'up':
        w = h =
          this.opts.filter.size *
          this.opts.filter.num *
          this.opts.prev.num_filters;
        return { w: w, h: h };
      case 'output':
        w = h = this.opts.filter.size * this.opts.prev.num_filters;
        return { w: w, h: h };
      //this.opts.filter.size *
      //this.opts.filter.num *
      //this.opts.prev.num_filters;
      default:
        throw "Type must be 'down', 'up' or 'output'.";
    }
  }

  get input() {
    return this.input_tex;
  }

  get output() {
    return this.output_tex;
  }

  get filter() {
    return this.filters_tex;
  }

  get bias() {
    return this.bias_tex;
  }

  forward() {
    this.gl.useProgram(this.program);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.output_fb);

    this.gl.uniform1i(this.uniforms.input_tex, 0);
    this.gl.uniform1i(this.uniforms.filters_tex, 1);
    this.gl.uniform1i(this.uniforms.filters_smask, 2);
    this.gl.activeTexture(this.gl.TEXTURE0 + 0);
    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.opts.input.texture ? this.opts.input.texture : this.input_tex
    );
    this.gl.activeTexture(this.gl.TEXTURE0 + 1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.filters_tex);
    this.gl.activeTexture(this.gl.TEXTURE0 + 2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.filters_smask);

    this.gl.viewport(
      0,
      0,
      this.opts.output.size * this.opts.filter.num,
      this.opts.output.size * this.opts.filter.num
    );

    this.gl.uniform2f(
      this.uniforms.filter_texel_size,
      1 / this.opts.filter.shape.w,
      1 / this.opts.filter.shape.h
    );
    this.gl.uniform2f(
      this.uniforms.input_texel_size,
      1 / (this.opts.input.size * this.opts.prev.num_filters),
      1 / (this.opts.input.size * this.opts.prev.num_filters)
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
      this.opts.prev.num_filters,
      this.opts.prev.num_filters
    );
    this.gl.uniform2f(
      this.uniforms.num_filters,
      this.opts.filter.num,
      this.opts.filter.num
      //this.opts.filter.type !== 'output' ? this.opts.filter.num : 1
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.verts.length / 2);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}
