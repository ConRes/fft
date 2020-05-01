// @ts-check

/**
 *
 * SEE:
 *   - https://cnx.org/contents/ulXtQbN7@15/Implementing-FFTs-in-Practice
 *   - https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm
 *
 * @param {*} input
 * @param {*} output
 * @param {fft.Options} [options]
 */
export function fft(input, output, options) {
  ({
    direction: options.direction = fft.defaults.direction,
    algorithm: options.algorithm = fft.defaults.algorithm,
    order: options.order = fft.defaults.order,
    traversal: options.traversal = fft.defaults.traversal,
  } = options = {...fft.defaults, ...options});

  if (options.direction === 'forward') {
  } else if (options.direction === 'inverse') {
  } else {
    throw Error('fft: invalid direction');
  }

  return output;
}

/**
 * @param {Uint8Array} input
 * @param {Float64Array} output
 * @param {fft.Options} options
 */
fft.forward = function(input, output, options) {};

/**
 * @param {Float64Array} input
 * @param {Uint8Array} output
 * @param {fft.Options} options
 */
fft.inverse = function(input, output, options) {};

fft.defaults = Object.freeze({
  direction: /** @type {'forward'|'inverse'|undefined} */ (undefined),
  algorithm: /** @type {'Cooley–Tukey'} */ ('Cooley–Tukey'),
  order: /** @type {'row'|'column'} */ ('row'),
  traversal: /** @type {'depth-first'|'breadth-first'} */ ('depth-first'),
});

class ComplexArray extends Float64Array {
  get real() {
    if (!this.constructor || this !== this.constructor.prototype) {
      const value = new Float32Array(this.buffer, 0, this.length);
      Object.defineProperty(this, 'real', {value});
      return value;
    }
  }
  get imaginary() {
    if (!this.constructor || this !== this.constructor.prototype) {
      const value = new Float32Array(this.buffer, 1, this.length);
      Object.defineProperty(this, 'imaginary', {value});
      return value;
    }
  }
}

/** @typedef {{ -readonly [k in keyof fft['defaults']]?: fft['defaults'][k]}} fft.Options */

/* SEE:
- https://cnx.org/contents/ulXtQbN7@15/Implementing-FFTs-in-Practice
- https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm
*/
