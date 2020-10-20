import Conv2D from './conv2d_class.js';

export default class Up2D extends Conv2D {
  constructor(gl, _opts, _program) {
    super(gl, _opts, _program);
  }

  initTextures() {
    let [internalFormat, format] = this.getTextureFormat(
      this.opts.input.num_channels
    );
    this.input_tex = this.createTexture({
      width: this.opts.input.size * this.opts.prev.num_filters,
      height: this.opts.input.size * this.opts.prev.num_filters,
      data: this.opts.input.data,
      internalFormat: internalFormat,
      format: format,
    });

    // FILTERS ------------------------------------------
    [internalFormat, format] = this.getTextureFormat(
      this.opts.filter.num_channels
    );
    this.opts.filter.texel_size =
      this.opts.filter.size * this.opts.filter.num * this.opts.prev.num_filters;
    this.filters_tex = this.createTexture({
      width: this.opts.filter.texel_size,
      height: this.opts.filter.texel_size,
      data: this.opts.filter.data
        ? this.opts.filter.data
        : this.generateImageData(
            this.opts.filter.texel_size,
            this.opts.filter.texel_size,
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
}
