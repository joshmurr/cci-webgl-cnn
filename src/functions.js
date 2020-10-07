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

export function generateImageData(w, h, num_channels, value = null) {
  let data = new Uint8Array(w * h * num_channels);
  for (let i = 0; i < w * num_channels; i += num_channels)
    for (let j = 0; j < h; j++)
      for (let c = 0; c < num_channels; c++) {
        data[i + w * num_channels * j + c] = value
          ? value
          : Math.floor(Math.random() * 255);
      }
  return data;
}

export function generateGradient(w, h, d) {
  let data = new Uint8Array(w * h * d);
  let counter = 0;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      for (let k = 0; k < d; k++) {
        data[i + w * j + w * h * k] = counter++ % 255;
      }
    }
  }
  return data;
}

export function generateLine(w, h, d) {
  let data = new Uint8Array(w * h * d);
  const B = [0, 0, 0];
  const W = [255, 255, 255];
  for (let i = 0; i < data.length; i += 3) {
    const c = (i / 3) % w < w / 2 ? B : W;
    data.set(c, i);
  }
  return data;
}

export function generateFour() {
  let d = [
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0, 255,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0, 255,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
      0,   0,   0,   0,   0, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 255, 255, 255, 255,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 
  ]; //prettier-ignore
  let data = [];
  for (let i = 0; i < d.length; i++) {
    data.push(d[i]);
    data.push(d[i]);
    data.push(d[i]);
  }
  //console.log(data);
  return new Uint8Array(data);
}

const sixt = () => Math.floor(255 * 0.0625);
const quar = () => Math.floor(255 * 0.25);
const eith = () => Math.floor(255 * 0.125);

export function filter() {
  // Red Filter
  let filter = [
    255, 255, 255,  255, 255, 255,  255, 255, 255,  255, 255, 255,
    255, 255, 255,  255, 255, 255,  255, 255, 255,  255, 255, 255,
    255, 255, 255,  255, 255, 255,  255, 255, 255,  255, 255, 255,
    255, 255, 255,  255, 255, 255,  255, 255, 255,  255, 255, 255,
  ]; //prettier-ignore
  return new Uint8Array(filter);
}

export function diagFilter() {
  // Red Filter
  let filter = [
    255, 255, 255,    0,   0,   0,    0,   0,   0,    0,   0,   0,
      0,   0,   0,  255, 255, 255,    0,   0,   0,  255, 255, 255,
      0,   0,   0,    0,   0,   0,  255, 255, 255,  255, 255, 255,
      0,   0,   0,  255, 255, 255,  255, 255, 255,    0,   0,   0,
  ]; //prettier-ignore
  return new Uint8Array(filter);
}

export function diagFilterOpp() {
  // Red Filter
  let filter = [
      0,   0,   0,    0,   0,   0,    0,   0,   0,  255, 255, 255,
    255, 255, 255,    0,   0,   0,  255, 255, 255,    0,   0,   0,
    255, 255, 255,  255, 255, 255,    0,   0,   0,    0,   0,   0,
      0,   0,   0,  255, 255, 255,  255, 255, 255,    0,   0,   0,
  ]; //prettier-ignore
  return new Uint8Array(filter);
}
export function sidesFilter() {
  // Red Filter
  let filter = [
      0,   0,  0, 128, 128, 128, 128, 128, 128,  255, 255, 255,
      0,   0,  0, 128, 128, 128, 128, 128, 128,  255, 255, 255,
      0,   0,  0, 128, 128, 128, 128, 128, 128,  255, 255, 255,
      0,   0,  0, 128, 128, 128, 128, 128, 128,  255, 255, 255,
  ]; //prettier-ignore
  return new Uint8Array(filter);
}

export function topBottomFilter() {
  // Red Filter
  let filter = [
    255, 255, 255,255, 255, 255,255, 255, 255,255, 255, 255,
    128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 
    128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 

  ]; //prettier-ignore
  return new Uint8Array(filter);
}
