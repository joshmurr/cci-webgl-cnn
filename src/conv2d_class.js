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
            this.opts.filter.num_channels
          ),
      internalFormat: this.gl[internalFormat],
      format: this.gl[format],
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

  getFilterShape(_type) {
    let w, h;
    switch (_type) {
      case 'down':
        w = h = this.opts.filter.size * this.opts.filter.num;
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

  forward() {
    this.gl.useProgram(this.program);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.output_fb);

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
