/// <reference path='./types/types.d.ts' />
/// <reference path='./types/window.d.ts' />

import {Complex} from './complex';
import filter from './filter';
import iterate from './iteration';
import ComplexArray from './complex-array';
import cisExp, {cisTables} from './cis-exp';
import {round, mround, trunc, diagonal} from './math';
import initializeData from './data';
// tslint:disable: no-magic-numbers no-duplicate-constiable space-before-function-paren

const {
  window: {requestIdleCallback, navigator: {hardwareConcurrency = 1} = {} as Window['navigator']} = {} as Window,
} = globalThis;

const workerSizes = [128];
hardwareConcurrency > 0 && workerSizes.push(256);
hardwareConcurrency > 1 && workerSizes.push(512);
hardwareConcurrency > 4 && workerSizes.push(1024);
hardwareConcurrency > 6 && workerSizes.push(2048);

export const workers = {};
export const useWorkers = typeof Worker === 'function';

useWorkers &&
  workerSizes.forEach(size => {
    try {
      workers[size] = new Worker('./worker.js');
      // workers[size].postMessage({ action: 'cisExp', buffer: cisExp.buffer });
      hardwareConcurrency > 4 &&
        requestIdleCallback(() => workers[size].postMessage({action: 'preGenerate', size: size ** 2}), {
          timeout: size * 2,
        });
    } catch (exception) {
      console.warn(exception);
    }
  }, workers);

export const outdated = object => (object && object.outdated === true) || false; // : { outdated?: boolean }, i = 0) => !(i % 100) ? object.outdated === true : false;
export const FFT = (input: RealDataLike, output: ComplexDataLike): ComplexData =>
  // @ts-ignore
  forwardFFT(initializeData(input), initializeData(output), {start: 0, offset: 0, size: input.length, step: 1});
export const IFFT = (input: ComplexDataLike, output: RealDataLike): RealData =>
  // @ts-ignore
  inverseFFT(initializeData(input), initializeData(output), {start: 0, offset: 0, size: input.length, step: 1});

const {PI, imul, sin, cos, sqrt, abs, hypot} = Math,
  PI2 = PI * 2;
const voidExp = [];

/**
 * Fourier Transform/Inverse Pairs:
 *  Given   f(x) <=> F(u)
 *      let     F(u) = ∫ f(x) * e ** -j2πux dx;
 *              f(x) = ∫ F(u) * e ** j2πux du;
 *      where   x = -∞ … ∞ in the 1D spatial coordinates domain
 *              u = -∞ … ∞ in the respective spatial frequency domain
 *              j = √-1
 *
 *  Given   f(x,y) <=> F(u,v)
 *      let     F(u,v) = ∫∫ f(x,y) * e ** -j2π(ux+vy) dx dy;
 *              f(x,y) = ∫∫ F(u,v) * e ** j2π(ux+vy)  du dv;
 *      where   x & y = -∞ … ∞ in orthogonal 2D spatial coordinates domains
 *              u & v = -∞ … ∞ in the respective spatial frequency domains
 *
 * @see http://www.csc.kth.se/utbildning/kth/kurser/DD2422/bildat08/report_FFT.pdf
 * @see http://www.robots.ox.ac.uk/~az/lectures/ia/lect2.pdf
 */
export function transform($in: TypedArray, $out: TypedArray, direction: 'forward' | 'inverse'): boolean {
  const forward = direction === 'forward',
    sign = forward ? 1 : -1,
    PIt = PI2; //  -1 * sign * PI2; // forward ? -1 * PI2 : PI2;
  const validData = $in && $in.length > 0 && $out && $out.length > 0;
  const fromReal = validData && $in.length === $out.length / 2,
    fromComplex = validData && $in.length === $out.length;
  const size = fromReal ? $in.length : fromComplex ? $in.length / 2 : 0; // n = size, n2 = n >> 1, n4 = n >> 2, n8 = n >> 3; // tslint:disable-line:no-bitwise
  const cis = cisTables.get(size),
    [n, n2, n4, n8] = cis.n;

  if (!size || !(validData && (fromReal || fromComplex))) return false;
  // let iteration = 0; const rounding = 1000000, matching = [];

  const integrate: (size: number, start: number, offset: number, step: number) => boolean = (
    size,
    start,
    offset,
    step,
  ) => {
    const length = size / 2,
      end = start + length,
      d = n / size; // const twiddle = PIt / size;
    // let h = 0; const d = n / size; // tslint:disable-line:no-bitwise

    // Cooley-Tukey decimation-in-time radix-2 FFT
    // for (let k = start, kt, k1, k2, r1, i1, r2, i2, t, t1, rt, it, rk, ik, rr, ir, ri, ii;
    for (
      let k = start, h = 0, k1, k2, r1, i1, r2, i2, rt, it, rk, ik;
      ((k1 = imul(k, 2)),
      (k2 = imul(k + length, 2)),
      (r1 = $out[k1]),
      (i1 = $out[k1 + 1]),
      (r2 = $out[k2]),
      (i2 = $out[k2 + 1]),
      // t = cisExp.create(k * twiddle), // rt = t[0], it = t[1],
      // kt = k * twiddle, t1 = [cos(kt), sign * sin(kt)], // rt = cos(kt), it = sin(kt), t1 = [rt, it],
      // rt = cisTable[h + n4], it = sign * cisTable[h],
      (rt = cis[h + n4]),
      (it = sign * cis[h]),
      (rk = (r2 || i2) && r2 * rt + i2 * it),
      (ik = (r2 || i2) && -r2 * it + i2 * rt)),
        k < end;
      k++, h += d
    )
      ($out[k1] += rk), ($out[k1 + 1] += ik), ($out[k2] = r1 - rk), ($out[k2 + 1] = i1 - ik);
    // {
    //     // if (sign > 0 && matching.length < 100) {
    //     //     const tv = Array.from(new Float32Array(t1));
    //     //     const cv = tv[0], sv = tv[1], tn = cisTable.length;
    //     //     const t2 = [rt, it], cd = abs(t2[0] - cv), sd = abs(t2[1] - sv);
    //     //     matching.push({
    //     //         c1: cv, c2: t2[0], cd: `${abs(round(cd * 100 / PI))}%`,
    //     //         s1: sv, s2: t2[0], sd: `${abs(round(sd * 100 / PI))}%`,
    //     //         h,
    //     //     });
    //     //     // console.log(iteration, { ti: [ci, si], td, ts: { t1: tv, t2 } }); // k, kt: k * twiddle,
    //     // }
    //     $out[k1] += rk, $out[k1 + 1] += ik, $out[k2] = r1 - rk, $out[k2 + 1] = i1 - ik;
    //     // h += d;
    // }
    // iteration++;
    return true;
  };

  const translate: (start: number, offset: number) => boolean = fromReal
    ? (start, offset) => (($out[start * 2] = $in[offset] || 0), ($out[start * 2 + 1] = 0), true)
    : fromComplex
    ? (start, offset) => (
        ($out[start * 2] = $in[offset * 2] || 0), ($out[start * 2 + 1] = $in[offset * 2 + 1] || 0), true
      )
    : (start, offset) => false;

  const aggregate = (size, start, offset, step) =>
    size === 1 ? translate(start, offset) : size > 1 ? integrate(size, start, offset, step) : false;

  // return iterate({ size }, aggregate), true;
  iterate({size}, aggregate);
  // console.table(matching);
  return true;
}

function iterateFFT(
  input: RealData | ComplexData | Uint8Array | Uint8ClampedArray | Float32Array,
  output: ComplexArray | ComplexData | Float32Array,
  direction: 'forward' | 'inverse',
) {
  const $in: TypedArray = (input['BYTES_PER_ELEMENT']
    ? input
    : input instanceof ComplexArray
    ? input.data
    : input) as TypedArray;
  const $out: TypedArray =
    output instanceof ComplexArray ? (output.data as TypedArray) : ((output as any) as TypedArray);
  transform($in, $out, direction);
}

function forwardFFT(
  this: any,
  input: RealData,
  output: MutableData<ComplexData>,
  {start = 0, offset = 0, size = input.length, step = 1}: FFTIteration = {},
) {
  // const iterator = iterateFFT({ start, offset, size, step }, 'forward', input, output);
  const iterator = iterateFFT(input, output, 'forward');
  return processForwardData(output), output as ComplexData; // input['outdated'] || output['outdated'] || processFFT(output), output as ComplexData;
}

// -tslint:disable-next-line:cyclomatic-complexity
export function processForwardData(output: ComplexData, {length = output.length} = {}) {
  let max = -Infinity,
    min = Infinity; // let rmax = -Infinity, rmin = Infinity, imax = -Infinity, imin = Infinity;
  output['outdated'] = output['outdated'] === true;
  const $out: TypedArray =
    output instanceof ComplexArray ? (output.data as TypedArray) : ((output as any) as TypedArray);
  const factor = 2 / length;
  for (let k = 0; k < length; k++) {
    // !outdated(output) &&
    const k0 = imul(k, 2),
      r = $out[k0],
      i = $out[k0 + 1];
    // const t = output.get(k), { real: r, imag: i } = t;
    const m = hypot(r, i); // factor * ((r ** 2 + i ** 2) ** 0.5); // (Complex.magnitude2(r || 0, i || 0) ** 0.5);
    (m > max && ((max = m), true)) || (m < min && ((min = m), true)); // (r > rmax && (rmax = r, true)) || (r < rmin && (rmin = r, true)); (i > imax && (imax = i, true)) || (i < imin && (imin = i, true));
  }
  return (output.max = max), (output.min = min), output as ComplexData; // out['rmax'] = rmax, out['rmin'] = rmin; out['imax'] = imax, out['imin'] = imin;
}

function inverseFFT(
  this: any,
  input: ComplexData,
  output: MutableData<RealData | ComplexData>,
  {start = 0, offset = 0, size = input.length, step = 1}: FFTIteration = {},
) {
  const intrim = (output['intrim'] = Object.defineProperty(new ComplexArray(size), 'progress', {
    get: () => output.progress,
    set: progress => (output.progress = progress),
  }));
  intrim['filteredSize'] = input['filteredSize'];
  // const iterator = iterateFFT({ start, offset, size, step }, 'inverse', input, intrim); // const filteredSize = isNaN(input['filteredSize']) ? NaN : input['filteredSize']; // 'filteredSize' in input && !isNaN(input['filteredSize']) ? input['filteredSize'] : size;
  const iterator = iterateFFT(input, intrim, 'inverse'); // const filteredSize = isNaN(input['filteredSize']) ? NaN : input['filteredSize']; // 'filteredSize' in input && !isNaN(input['filteredSize']) ? input['filteredSize'] : size;
  return processInverseData(intrim, output), output as RealData; // input['outdated'] || output['outdated'] || processInverseData(output), output as RealData;
}

export function processInverseData(
  intrim: ComplexData,
  output: MutableData<RealData | ComplexData>,
  {length = intrim.length, denominator = length} = {},
) {
  // intrim['filteredSize'] ||
  let max = -Infinity,
    min = Infinity; // const magnitudes = Array(size);
  // const count = intrim['filteredSize'], factor = count > 0 ? (length / count) : 1;
  for (let k = 0; k < length; k++) {
    // !outdated(output) &&
    const t = intrim.get(k),
      {real = 0} = t as Complex,
      v = (real || 0) / denominator;
    output.set(k, v);
    v > max ? (max = v) : v < min ? (min = v) : false;
  }
  return (output.max = max), (output.min = min), output as RealData;
}

const {plusTimes, minusTimes, plusTimesSet, minusTimesSet} = Complex;

export default {Complex, ComplexArray, forward: FFT, inverse: IFFT, filter, initializeData, outdated};
export {FFT as forward, IFFT as inverse, initializeData};
