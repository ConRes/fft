/// <reference path='./types/types.d.ts' />

import Complex from './complex';
import {diagonal, round, floor, ceil} from './math';

// tslint:disable:no-bitwise prefer-object-spread

const {PI, exp, min, max, imul, fround, log, log2} = Math;

const parseFilterInput = (
  input: number | Dimensions | Data<any>,
): {mode: 'render' | 'filter'; dimensions: Dimensions; data?: Data<any>} => {
  if (typeof input === 'number') input = [input, input];
  if (input.length === 1) input = [input[0], input[0]];
  const mode = input.length === 2 ? 'render' : 'filter';
  return mode === 'render'
    ? {mode, dimensions: input as Dimensions} // , data: new Uint8ClampedArray(input[0] * input[1]).fill(0) }
    : {mode, dimensions: Array(2).fill(input.length ** 0.5) as Dimensions}; // , data: input
};

export const parseFilterRange = ({
  lowBand = NaN,
  highBand = NaN,
  low = NaN,
  high = NaN,
  noLow,
  noHigh,
  sameBand,
  size = Infinity,
  radius = size ? diagonal(size) : NaN,
}: FilterParameters = {}) => (
  size > 0
    ? ((sameBand = lowBand === highBand),
      (noLow = sameBand || isNaN(lowBand) || lowBand <= 0),
      (noHigh = sameBand || isNaN(highBand) || highBand >= radius),
      (low = sameBand ? NaN : noLow ? ((lowBand = NaN), -radius) : lowBand ** 2),
      (high = sameBand ? NaN : noHigh ? ((highBand = NaN), radius) : highBand ** 2))
    : ((lowBand = highBand = low = high = size = radius = NaN), (noLow = false), (noHigh = false)),
  {lowBand, highBand, sameBand, low, high, noLow, noHigh, size, radius}
);

export declare function gaussian(x: number, mean: number, sigma: number): number;

export namespace gaussian {
  export const twiddle = (2 * PI) ** 0.5;
  export const gaussian = (χ: number, α: number, σ: number, δ = σ ** 2, ω = σ * twiddle) =>
    exp(-((χ - α) ** 2) / (δ * 2)) / ω;
}
(gaussian as any) = Object.assign(gaussian.gaussian, gaussian);

const rectBandFilter = (d, low, high): number => d > low - 0.5 && ((d < high + 0.5) as any); // (d) => d > low && d < high;

const multiplyFilters = (...filters: Float32Array[]) =>
  filters.length === 1
    ? filters[0]
    : filters.reduce((result, filter) => {
        length = result && result.length > 0 && filter && filter.length > 0 && min(result.length, filter.length);
        for (let i = 0; i < length; i++) result[i] *= filter[i] || 0;
        return result;
      }, Float32Array.from(filters[0]));

const combineFilters = (...filters: Float32Array[]) =>
  filters.reduce((result, filter) => {
    length = result && result.length > 0 && filter && filter.length > 0 && min(result.length, filter.length);
    for (let i = 0; i < length; i++) result[i] = min(1, result[i] + filter[i] || 0);
    return result;
  }, Float32Array.from(filters[0]));

const normalizeFilter = (
  filter: Float32Array,
  norm = filter.reduceRight((norm, v) => (v > norm ? v : norm), -Infinity),
) => filter.map(v => v / norm);

const radialFilter = (ρ: number, ƒ: (x: number) => number) => new Float32Array(ρ).map((x, i) => ƒ(i)); // .fill(1);

const filters = new Map<string, any>();

export function filter(dimensions?: Dimensions | number, lowPass?: Band, highPass?: Band, options?: FilterOptions);

export function filter(data: Data<any>, lowPass?: Band, highPass?: Band, options?: FilterOptions);

export function filter(
  input: number | Dimensions | Data<any>,
  lowPass: Band = NaN,
  highPass: Band = NaN,
  {fill = 1, clear = 0}: FilterOptions = {},
) {
  const {mode, dimensions} = parseFilterInput(input),
    isRender = mode === 'render',
    isFilter = mode === 'filter';
  const [M, N] = dimensions,
    M2 = M / 2,
    N2 = N / 2,
    MN = M * N; // I = Math.min(M, N); // D = (I ** 2 * 2) ** 0.5;

  const {
    low: lowSquare,
    high: highSquare,
    noLow,
    noHigh,
    sameBand,
    size,
    radius,
    size: I,
    radius: D,
  } = parseFilterRange({lowBand: lowPass, highBand: highPass, size: min(M, N)});
  const low = (lowSquare && lowSquare ** 0.5) || 0,
    high = (highSquare && highSquare ** 0.5) || radius;
  const hasHigh = high !== radius,
    hasLow = low !== 0,
    hasBand = hasHigh || hasHigh;

  const id = hasBand && `${I} ${low}:${high}`;
  if (id && filters.has(id)) return filters.get(id);

  // New Filter Computations
  const delta = min(high || radius, radius) - max(0, low || 0);
  const variance = log2(4) * 2,
    norm = variance ** 0.5 * gaussian.twiddle;

  const turbomazeFilter = () => normalizeFilter(radialFilter(radius, i => rectBandFilter(i, low, high)));
  const gaussianFilter = () =>
    normalizeFilter(
      multiplyFilters(
        radialFilter(radius, i => exp(-((i >= high ? i - high : i <= low ? i - low : 0) ** 2) / variance / 2)),
        // radialFilter(radius, (i) => rectBandFilter(i, low - variance, high + variance)),
      ),
    );
  const filter = [turbomazeFilter, gaussianFilter][1]();
  // console.log({ filter });
  const N0 = Math.max(0, floor((N - highSquare) / 2)),
    M0 = Math.max(0, floor((N - highSquare) / 2));
  // const N0 = 0, M0 = 0;

  // if (isRender) {
  const data = new Float32Array(M * N);
  let zeros = true,
    ones = false;
  if (sameBand || !hasBand) data.fill(fill), (zeros = true), (ones = false);
  else {
    // if (hasBand)
    for (let k = N0, t, b, dm; ((t = k * M), (b = MN - t), (dm = imul(k - M2, k - M2))), k <= N2; k++)
      for (
        let l = M0, r, d, i;
        ((r = M - l), (d = dm + imul(l - N2, l - N2)), (i = (d > 1 && round(d ** 0.5)) || 0)), l <= M2;
        l++
      )
        data[t + l] = data[t + r] = data[b + l] = data[b + r] = filter[i] || 0;
    // const v = fill;
    // for (let k = N0, d, df, dl, dh, dv; k <= N2; k++) {
    //     const t = k * M, b = MN - t, dM = imul(k - M2, k - M2); // (k - M2) ** 2;
    //     for (let l = M0, i, r = M - l; l <= M2; r = M - l++) {
    //         d = dM + imul(l - N2, l - N2), i = round(d ** 0.5); // dM + (l - N2) ** 2;
    //         data[t + l] = data[t + r] = data[b + l] = data[b + r] = filter[i] || 0;
    //         // data[t + l] = data[b + r] = gaussianFilter[i] || 0, data[t + r] = data[b + l] = rectFilter[i] || 0;
    //         // test(d) && (data[t + l] = data[t + r] = data[b + l] = data[b + r] = v);
    //     }
    // }
  }
  (data['zeros'] = data.includes(0)), (data['ones'] = data.includes(1));
  filters.set(id, data);
  return data;
  // } else {
  //     // data = input as Data<any>;
  //     // const apply = typeof data[0] === 'number' ?
  //     //     (idx) => { data[idx] = clear; } :
  //     //     (idx) => { data[idx].real = clear, data[idx].imag = clear; };
  //     // for (let k = N0; k < N; k++) {
  //     //     // const i0 = k * M, i1 = N - i0, d0 = (k - M2) ** 2;
  //     //     const t = k * M, b = MN - t, dM = (k - M2) ** 2;
  //     //     for (let l = M0, r = M - l; l <= M2; r = M - l++)
  //     //         test(dM + ((l - N2) ** 2)) && (apply(t + l), apply(t + r), apply(b + l), apply(b + r));
  //     // }
  // }

  // return mode === 'render' ? data as Uint8ClampedArray : data as ComplexData;
}

export default filter;
