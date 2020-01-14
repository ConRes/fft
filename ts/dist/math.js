// @ts-nocheck
const { hypot: _hypot } = Math;
const hypot = (a, b = a) => _hypot(a, b);
const trunc = v => ~~(1 * v);
const floor = (v, t = trunc(v)) => (v === t ? t : v >= t ? t : t - 1);
const ceil = (v, f = floor(v)) => (v >= 0 ? f + 1 : f >= v ? f : f + 1);
const round = (v, t = trunc(v)) => v === t ? t : v >= 0 ? (v - t < 0.5 ? t : t + 1) : t - v < 0.5 ? t : t - 1;
const diagonal = (a, b = a) => ceil(hypot(a, b));

export { ceil, diagonal, floor, hypot, round, trunc };
//# sourceMappingURL=math.js.map
