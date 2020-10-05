export function createProgram(gl, vsSource, fsSource) {
  const shaderProgram = gl.createProgram();
  const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    return shaderProgram;
  }

  console.error('Error creating shader program!');
  gl.deleteProgram(shaderProgram);
}

export function createShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw 'Could not compile WebGL program. \n\n' + info;
  }
  return shader;
}

export function createTexture(gl, program, idx, color) {
  // Texture
  const textureLocation = gl.getUniformLocation(program, 'u_texture');
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + idx);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    1,
    1,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    new Uint8Array([color])
  );

  //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  return texture;
}

export function generateImageData(w, h, num_channels) {
  let data = new Uint8Array(w * h * num_channels);
  for (let i = 0; i < w * num_channels; i += num_channels)
    for (let j = 0; j < h; j++)
      for (let c = 0; c < num_channels; c++) {
        data[i + w * num_channels * j + c] = Math.floor(Math.random() * 255);
      }
  return data;
}

export function generate3DData(w, h, d) {
  let data = new Uint8Array(w * h * d);
  for (let i = 0; i < w; i++)
    for (let j = 0; j < h; j++)
      for (let k = 0; k < h; k++) {
        data[i + w * j + w * h * k] = Math.floor(Math.random() * 255);
      }
  return data;
}
