export default class Core {
  constructor(gl) {
    this.gl = gl;
    this.verts =      [-1, -1, -1, 1,  1, -1,   -1, 1, 1,  1, 1, -1]; //prettier-ignore
    this.texcoords = [ 0,  1,  0, 0,  1,  1,    0, 0, 1,  0, 1,  1]; //prettier-ignore
  }

  createProgram(vs, fs) {
    const program = this.gl.createProgram();
    const vertexShader = this.createShader(vs, this.gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(fs, this.gl.FRAGMENT_SHADER);
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      return program;
    }

    console.error('Error creating shader program!');
    this.gl.deleteProgram(program);
  }

  createShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      throw 'Could not compile WebGL program. \n\n' + info;
    }
    return shader;
  }

  createTexture(_opts) {
    let opts = {
      textureUnit: 0,
      type: this.gl.TEXTURE_2D,
      LOD: 0,
      internalFormat: this.gl.RGB8,
      width: 1,
      height: 1,
      border: 0,
      format: this.gl.RGB,
      dataType: this.gl.UNSIGNED_BYTE,
      data: new Uint8Array([0, 0, 255, 255]),
    };
    if (_opts) Object.assign(opts, _opts);

    const texture = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0 + opts.textureUnit);
    this.gl.bindTexture(opts.type, texture);
    this.gl.texImage2D(
      opts.type,
      opts.LOD,
      opts.internalFormat,
      opts.width,
      opts.height,
      opts.border,
      opts.format,
      opts.dataType,
      opts.data
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.REPEAT
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.REPEAT
    );

    return texture;
  }

  createFramebuffer(_tex) {
    const fb = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      _tex,
      0
    );
    return fb;
  }

  generateImageData(w, h, num_channels, r) {
    let len = w * h * num_channels;
    let data = [];
    //const range = this.getFilterRange(this.opts.filter.type);
    for (let i = 0; i < len; i++) {
      //let val = Math.random() * (range.max - range.min);
      //data.push(Math.floor(val + range.min));
      let s = r ? r : 255;
      data.push(Math.floor(Math.random() * s));
    }

    return new Uint8Array(data);
    //return new Int8Array(data);
  }

  getFilterRange(_r) {
    switch (_r) {
      case 'down':
      case 'up':
      case 'input':
      case 'output':
      default:
        return { min: 0, max: 255 };
    }
  }

  getTextureFormat(num_channels) {
    switch (num_channels) {
      case 1:
        return {
          internalFormat: 'R8',
          format: 'RED',
        };
      case 3:
        return {
          internalFormat: 'RGB8',
          format: 'RGB',
        };
    }
  }
}
