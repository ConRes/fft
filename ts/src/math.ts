const {hypot: _hypot} = Math;

export const {PI, imul, min, max, pow} = Math;

export const hypot: (a: number, b?: number) => number = (a, b = a) => _hypot(a, b);

export const trunc: (value: number) => number = v => ~~(1 * v); // tslint:disable-line:no-bitwise

export const floor: (value: number) => number = (v, t = trunc(v)) => (v === t ? t : v >= t ? t : t - 1);

export const ceil: (value: number) => number = (v, f = floor(v)) => (v >= 0 ? f + 1 : f >= v ? f : f + 1);

export const round: (value: number) => number = (v, t = trunc(v)) =>
  v === t ? t : v >= 0 ? (v - t < 0.5 ? t : t + 1) : t - v < 0.5 ? t : t - 1;

export const mround: (value: number, multiple: number) => number = (v, m, t = trunc(v * m) / m) =>
  v === t ? t : v >= 0 ? (v - t < 0.5 ? t : t + 1) : t - v < 0.5 ? t : t - 1;

export const power: (base: number, exponent: number) => number = (b, e) => b ** e; // Math.exp(Math.log(b), e);

export const diagonal: (a: number, b?: number) => number = (a, b = a) => ceil(hypot(a, b));

export const opposite: (b: number, a?: number) => number = (b, a = b) => power(power(b, 2) / 2, 0.5);
