// @ts-nocheck
import { Complex } from './complex.js';
import filter from './filter.js';
import iterate from './iteration.js';
import initializeData from './data.js';
export { default as initializeData } from './data.js';
import ComplexArray from './complex-array.js';
import { cisTables } from './cis-exp.js';

const { window: { requestIdleCallback, navigator: { hardwareConcurrency = 1 } = {} } = {}, } = globalThis;
const workerSizes = [128];
hardwareConcurrency > 0 && workerSizes.push(256);
hardwareConcurrency > 1 && workerSizes.push(512);
hardwareConcurrency > 4 && workerSizes.push(1024);
hardwareConcurrency > 6 && workerSizes.push(2048);
const workers = {};
const useWorkers = typeof Worker === 'function';
useWorkers &&
    workerSizes.forEach(size => {
        try {
            workers[size] = new Worker('./worker.js');
            hardwareConcurrency > 4 &&
                requestIdleCallback(() => workers[size].postMessage({ action: 'preGenerate', size: size ** 2 }), {
                    timeout: size * 2,
                });
        }
        catch (exception) {
            console.warn(exception);
        }
    }, workers);
const outdated = object => (object && object.outdated === true) || false;
const FFT = (input, output) => forwardFFT(initializeData(input), initializeData(output), { start: 0, offset: 0, size: input.length, step: 1 });
const IFFT = (input, output) => inverseFFT(initializeData(input), initializeData(output), { start: 0, offset: 0, size: input.length, step: 1 });
const { PI, imul, sin, cos, sqrt, abs, hypot } = Math;
function transform($in, $out, direction) {
    const forward = direction === 'forward', sign = forward ? 1 : -1;
    const validData = $in && $in.length > 0 && $out && $out.length > 0;
    const fromReal = validData && $in.length === $out.length / 2, fromComplex = validData && $in.length === $out.length;
    const size = fromReal ? $in.length : fromComplex ? $in.length / 2 : 0;
    const cis = cisTables.get(size), [n, n2, n4, n8] = cis.n;
    if (!size || !(validData && (fromReal || fromComplex)))
        return false;
    const integrate = (size, start, offset, step) => {
        const length = size / 2, end = start + length, d = n / size;
        for (let k = start, h = 0, k1, k2, r1, i1, r2, i2, rt, it, rk, ik; ((k1 = imul(k, 2)),
            (k2 = imul(k + length, 2)),
            (r1 = $out[k1]),
            (i1 = $out[k1 + 1]),
            (r2 = $out[k2]),
            (i2 = $out[k2 + 1]),
            (rt = cis[h + n4]),
            (it = sign * cis[h]),
            (rk = (r2 || i2) && r2 * rt + i2 * it),
            (ik = (r2 || i2) && -r2 * it + i2 * rt)),
            k < end; k++, h += d)
            ($out[k1] += rk), ($out[k1 + 1] += ik), ($out[k2] = r1 - rk), ($out[k2 + 1] = i1 - ik);
        return true;
    };
    const translate = fromReal
        ? (start, offset) => (($out[start * 2] = $in[offset] || 0), ($out[start * 2 + 1] = 0), true)
        : fromComplex
            ? (start, offset) => (($out[start * 2] = $in[offset * 2] || 0), ($out[start * 2 + 1] = $in[offset * 2 + 1] || 0), true)
            : (start, offset) => false;
    const aggregate = (size, start, offset, step) => size === 1 ? translate(start, offset) : size > 1 ? integrate(size, start) : false;
    iterate({ size }, aggregate);
    return true;
}
function iterateFFT(input, output, direction) {
    const $in = (input['BYTES_PER_ELEMENT']
        ? input
        : input instanceof ComplexArray
            ? input.data
            : input);
    const $out = output instanceof ComplexArray ? output.data : output;
    transform($in, $out, direction);
}
function forwardFFT(input, output, { start = 0, offset = 0, size = input.length, step = 1 } = {}) {
    const iterator = iterateFFT(input, output, 'forward');
    return processForwardData(output), output;
}
function processForwardData(output, { length = output.length } = {}) {
    let max = -Infinity, min = Infinity;
    output['outdated'] = output['outdated'] === true;
    const $out = output instanceof ComplexArray ? output.data : output;
    for (let k = 0; k < length; k++) {
        const k0 = imul(k, 2), r = $out[k0], i = $out[k0 + 1];
        const m = hypot(r, i);
        (m > max && ((max = m), true)) || (m < min && ((min = m), true));
    }
    return (output.max = max), (output.min = min), output;
}
function inverseFFT(input, output, { start = 0, offset = 0, size = input.length, step = 1 } = {}) {
    const intrim = (output['intrim'] = Object.defineProperty(new ComplexArray(size), 'progress', {
        get: () => output.progress,
        set: progress => (output.progress = progress),
    }));
    intrim['filteredSize'] = input['filteredSize'];
    const iterator = iterateFFT(input, intrim, 'inverse');
    return processInverseData(intrim, output), output;
}
function processInverseData(intrim, output, { length = intrim.length, denominator = length } = {}) {
    let max = -Infinity, min = Infinity;
    for (let k = 0; k < length; k++) {
        const t = intrim.get(k), { real = 0 } = t, v = (real || 0) / denominator;
        output.set(k, v);
        v > max ? (max = v) : v < min ? (min = v) : false;
    }
    return (output.max = max), (output.min = min), output;
}
var fft = { Complex, ComplexArray, forward: FFT, inverse: IFFT, filter, initializeData, outdated };

export default fft;
export { FFT, IFFT, FFT as forward, IFFT as inverse, outdated, processForwardData, processInverseData, transform, useWorkers, workers };
//# sourceMappingURL=fft.js.map
