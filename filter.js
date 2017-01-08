const { Transform } = require('stream');

class FilterStream extends Transform {
  constructor(fn) {
    super({ objectMode: true });
    this.filter = fn;
  }

  _transform(data, env, cb) {
    if (this.filter(data)) {
      this.push(data);
    };
    cb();
  }
};

module.exports = fn => new FilterStream(fn);
