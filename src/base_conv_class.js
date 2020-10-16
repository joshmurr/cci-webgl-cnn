import Core from './core_class.js';

export default class Base_Conv extends Core {
  constructor(gl, opts) {
    super(gl);
    this.base_opts = {
      vs_source: null,
      fs_source: null,
      filter_size: 4,
      num_filters: 1,
      output_size: 1,
    };

    Object.assign(this.base_opts, opts);
  }
}
