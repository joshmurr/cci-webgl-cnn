import Model from './model_class.js';
import Downsample from './downsample_class.js';

const gl = document.getElementById('c').getContext('webgl2');

const model = new Model(gl, {});
