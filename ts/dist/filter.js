// @ts-nocheck
import { diagonal, round, floor } from './math.js';

const { PI, exp, min, max, imul, fround, log, log2 } = Math;
const parseFilterInput = (input) => {
    if (typeof input === 'number')
        input = [input, input];
    if (input.length === 1)
        input = [input[0], input[0]];
    const mode = input.length === 2 ? 'render' : 'filter';
    return mode === 'render'
        ? { mode, dimensions: input }
        : { mode, dimensions: Array(2).fill(input.length ** 0.5) };
};
const parseFilterRange = ({ lowBand = NaN, highBand = NaN, low = NaN, high = NaN, noLow, noHigh, sameBand, size = Infinity, radius = size ? diagonal(size) : NaN, } = {}) => (size > 0
    ? ((sameBand = lowBand === highBand),
        (noLow = sameBand || isNaN(lowBand) || lowBand <= 0),
        (noHigh = sameBand || isNaN(highBand) || highBand >= radius),
        (low = sameBand ? NaN : noLow ? ((lowBand = NaN), -radius) : lowBand ** 2),
        (high = sameBand ? NaN : noHigh ? ((highBand = NaN), radius) : highBand ** 2))
    : ((lowBand = highBand = low = high = size = radius = NaN), (noLow = false), (noHigh = false)),
    { lowBand, highBand, sameBand, low, high, noLow, noHigh, size, radius });
var gaussian;
(function (gaussian_1) {
    gaussian_1.twiddle = (2 * PI) ** 0.5;
    gaussian_1.gaussian = (χ, α, σ, δ = σ ** 2, ω = σ * gaussian_1.twiddle) => exp(-((χ - α) ** 2) / (δ * 2)) / ω;
})(gaussian || (gaussian = {}));
gaussian = Object.assign(gaussian.gaussian, gaussian);
const rectBandFilter = (d, low, high) => d > low - 0.5 && (d < high + 0.5);
const multiplyFilters = (...filters) => filters.length === 1
    ? filters[0]
    : filters.reduce((result, filter) => {
        length = result && result.length > 0 && filter && filter.length > 0 && min(result.length, filter.length);
        for (let i = 0; i < length; i++)
            result[i] *= filter[i] || 0;
        return result;
    }, Float32Array.from(filters[0]));
const normalizeFilter = (filter, norm = filter.reduceRight((norm, v) => (v > norm ? v : norm), -Infinity)) => filter.map(v => v / norm);
const radialFilter = (ρ, ƒ) => new Float32Array(ρ).map((x, i) => ƒ(i));
const filters = new Map();
function filter(input, lowPass = NaN, highPass = NaN, { fill = 1, clear = 0 } = {}) {
    const { mode, dimensions } = parseFilterInput(input);
    const [M, N] = dimensions, M2 = M / 2, N2 = N / 2, MN = M * N;
    const { low: lowSquare, high: highSquare, noLow, noHigh, sameBand, size, radius, size: I, radius: D, } = parseFilterRange({ lowBand: lowPass, highBand: highPass, size: min(M, N) });
    const low = (lowSquare && lowSquare ** 0.5) || 0, high = (highSquare && highSquare ** 0.5) || radius;
    const hasHigh = high !== radius, hasBand = hasHigh || hasHigh;
    const id = hasBand && `${I} ${low}:${high}`;
    if (id && filters.has(id))
        return filters.get(id);
    const delta = min(high || radius, radius) - max(0, low || 0);
    const variance = log2(4) * 2, norm = variance ** 0.5 * gaussian.twiddle;
    const turbomazeFilter = () => normalizeFilter(radialFilter(radius, i => rectBandFilter(i, low, high)));
    const gaussianFilter = () => normalizeFilter(multiplyFilters(radialFilter(radius, i => exp(-((i >= high ? i - high : i <= low ? i - low : 0) ** 2) / variance / 2))));
    const filter = [turbomazeFilter, gaussianFilter][1]();
    const N0 = Math.max(0, floor((N - highSquare) / 2)), M0 = Math.max(0, floor((N - highSquare) / 2));
    const data = new Float32Array(M * N);
    let ones = false;
    if (sameBand || !hasBand)
        data.fill(fill), (ones = false);
    else {
        for (let k = N0, t, b, dm; ((t = k * M), (b = MN - t), (dm = imul(k - M2, k - M2))), k <= N2; k++)
            for (let l = M0, r, d, i; ((r = M - l), (d = dm + imul(l - N2, l - N2)), (i = (d > 1 && round(d ** 0.5)) || 0)), l <= M2; l++)
                data[t + l] = data[t + r] = data[b + l] = data[b + r] = filter[i] || 0;
    }
    (data['zeros'] = data.includes(0)), (data['ones'] = data.includes(1));
    filters.set(id, data);
    return data;
}

export default filter;
export { filter, gaussian, parseFilterRange };
//# sourceMappingURL=filter.js.map
