const gl = document.getElementsByTagName('canvas')[0].getContext('webgl2');

const vs = `#version 300 es
  in vec4 a_position;

  void main(){
    gl_Position = a_position;
  }
`;
const fs = `#version 300 es
  precision mediump float;

  out vec4 outcolor;

  void main(){
    outcolor = vec4(0.0, 1.0, 1.0, 1.0);
  }
`;

// SETUP SHADER PROGRAM --------------------------------
const v_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(v_shader, vs);
gl.compileShader(v_shader);
const f_shader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(f_shader, fs);
gl.compileShader(f_shader);

const program = gl.createProgram();
gl.attachShader(program, v_shader);
gl.attachShader(program, f_shader);
gl.linkProgram(program);
// -----------------------------------------------------

// SETUP POSITION BUFFER -------------------------------
const pos_attr = gl.getAttribLocation(program, 'a_position'); // Grabs attrib location from shader program
const buffer = gl.createBuffer(); // Creates empty buffer
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Binds buffer
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 0, 1, 1, -1]),
  gl.STATIC_DRAW
); // Fills currently bound buffer with position locations

gl.enableVertexAttribArray(pos_attr); // Must be enabled to 'select' it to allow for the following operations
gl.vertexAttribPointer(
  pos_attr, // Index
  2, // Size
  gl.FLOAT, // Type
  false, // Normalized
  0, // Stride
  0 // Offset
); // Binds the buffer currently bound to gl.ARRAY_BUFFER to a generic vertex attribute of the current vertex buffer object and specifies its layout.
// -----------------------------------------------------

gl.useProgram(program);
gl.clearColor(0.1, 0.2, 0.5, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);

console.log('glError:', gl.getError());
