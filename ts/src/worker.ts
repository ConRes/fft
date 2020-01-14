/// <reference path='./types/types.d.ts' />
// tslint:disable:no-bitwise prefer-object-spread

namespace FFT {
  var SharedArrayBuffer = typeof SharedArrayBuffer === 'undefined' ? ArrayBuffer : SharedArrayBuffer; // tslint:disable-line:prefer-const no-var-keyword
  declare var ImageBitmap: new (
    image: HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | ImageData | Blob,
    ...args: any[]
  ) => ImageBitmap;

  export const transferableTypes = [
    ...(typeof ArrayBuffer !== 'undefined' ? [ArrayBuffer] : []),
    ...(typeof MessagePort !== 'undefined' ? [MessagePort] : []),
    ...(typeof ImageBitmap !== 'undefined' ? [ImageBitmap] : []),
  ];

  export const transferables = <T extends object>(...objects: T[]) =>
    objects.filter(
      object => object && typeof object === 'object' && transferableTypes.find(type => object instanceof type),
    );

  const debugging = false;

  /* MATH */
  const {sin, cos, PI, abs, pow, hypot, imul} = Math,
    PI2 = 2 * PI,
    PI64 = 64 * PI;

  const trunc: (value: number) => number = v => ~~(1 * v);

  const floor: (value: number) => number = (v, t = trunc(v)) => (v === t ? t : v >= t ? t : t - 1);

  const ceil: (value: number) => number = (v, f = floor(v)) => (v >= 0 ? f + 1 : f >= v ? f : f + 1);

  const round: (value: number) => number = (v, t = trunc(v)) =>
    v === t ? t : v >= 0 ? (v - t < 0.5 ? t : t + 1) : t - v < 0.5 ? t : t - 1;

  const mround: (value: number, multiple: number) => number = (v, m, t = trunc(v * m) / m) =>
    v === t ? t : v >= 0 ? (v - t < 0.5 ? t : t + 1) : t - v < 0.5 ? t : t - 1;

  const diagonal = (a, b = a) => ceil(hypot(a, b));

  const now =
    typeof performance !== 'undefined' && performance.now ? performance.now.bind(performance) : Date.now.bind(Date);

  /* TWIDDLE: e^ix = cos x + i*sin x */
  namespace cisTables {
    const {PI, abs, sin, cos, sqrt, max} = Math; // const abs = (value: number) => value * ((value >= 0 || -1) as number);

    const Base = Float32Array;

    /**
     * CIS Lookup Table for s₏ sin(2πn/N) and c₏ for cos(2πn/N) terms, where N
     * is a base-2 single-term safe unsigned integer (2ⁿ) passed as the first
     * constructor argument for the table.
     *
     * @see https://en.wikipedia.org/wiki/Trigonometric_tables
     */
    export class CISTable extends (Base as typeof Base) {
      // private n: number; private n2: number; private n4: number; private n8: number;

      n: [number, number, number, number];

      constructor(public size: number) {
        super(new SharedArrayBuffer(Base.BYTES_PER_ELEMENT * (size * 1.25)));

        const [n, n2, n4, n8] = (this.n = [size, size >> 1, size >> 2, size >> 3]);

        const t = sin(PI / n),
          c0 = (this[n4] = 1),
          s0 = (this[0] = 0),
          n2p4 = n2 + n4;

        const dc0 = 2 * t ** 2,
          ds0 = max((2 - dc0) * dc0) ** 0.5,
          t0 = 2 * dc0;

        for (
          let i = 1, [dc, ds, t, c, s] = [dc0, ds0, t0, c0, s0];
          i < n8;
          i++ // dc = dc0, ds = ds0, t = t0, c = c0, s = s0; // c -= dc, dc += t * c, s += ds, ds -= t * s,
        )
          (this[i] = s += ds), (ds -= t * s), (this[n4 - i] = c -= dc), (dc += t * c); // c -= dc, dc += t * c, s += ds, ds -= t * s, this[i] = s, this[n4 - i] = c;

        if (n8 !== 0) this[n8] = 0.5 ** 0.5; // ** 0.5;

        for (let j = 0; j < n4; j++) this[n2 - j] = this[j]; // lim = n4
        for (let k = 0; k < n2p4; k++) this[n2 + k] = -this[k]; // lim = n2 + n4
      }
    }
    const tables = new Map<number, CISTable>();

    export const get = (size: number) => (!tables.has(size) && tables.set(size, new CISTable(size)), tables.get(size));
  }
  declare function cisTables(size: number): cisTables.CISTable;

  (cisTables as any) = Object.assign(cisTables.get, cisTables);

  /* ITERATION */
  // let lastIterator: FFTIteration & FFTIteration[];

  const compare = (a: any, b: any, keys: string[]) =>
    typeof a === typeof b && (!a || keys.every(key => a[key] === b[key]));

  const defaultIteration = {start: 0, offset: 0, size: 0, step: 1};

  const iterationKeys = Object.keys(defaultIteration);

  declare function iterate(
    iteration: FFTIteration,
    callback: (size: number, start: number, offset: number) => boolean,
  ): boolean;

  type Iteration = [number, number, number];

  namespace iterate {
    // export function generator(size: number, start: number, offset: number, step: number, iterations: Iteration[]): Iteration[];

    // export function generator(size?: number, start?: number, offset?: number, step?: number): IterableIterator<Iteration>;

    export function* generator(size = 0, start = 0, offset = 0, step = 1, iterations?: Iteration[]) {
      // : IterableIterator<Iteration> | Iteration[]
      const yields = !iterations,
        nextSize = size >> 1,
        nextStep = step << 1,
        nextStart = start + nextSize,
        nextOffset = offset + step; // tslint:disable-line:no-bitwise
      iterations = iterations || [];

      size > 1 &&
        (generator(nextSize, start, offset, nextStep, iterations).next(),
        generator(nextSize, nextStart, nextOffset, nextStep, iterations).next());

      size >= 1 && (iterations.push([size, start, offset]), yields && (yield* iterations));
    }
    const iterators = new Map<number, Iteration[]>();

    export function generate(size = 0, start = 0, offset = 0, step = 1): Iteration[] {
      let iterations: Iteration[];

      if (!start && !offset && step === 1) {
        if (iterators.has(size)) return iterators.get(size);

        const started = now();

        generator(size, start, offset, step, (iterations = [])).next();

        const ended = now(),
          elapsed = ended - started;

        debugging &&
          setTimeout(
            () =>
              console.info(`FFT: ▷ ${(size ** 0.5).toFixed(0)}² × ${iterations.length} ops / ${elapsed.toFixed(1)}ms`),
            0,
          );

        iterators.set(size, iterations);
      } else {
        iterations = Array.from(generator(size, start, offset, step));
      }
      return iterations;
    }
    export function iterate(
      {start = 0, offset = 0, size = 0, step = 1, remaining = true, completed = 0}: FFTIteration,
      callback: (size?: number, start?: number, offset?: number) => boolean,
    ): Iteration[] {
      const iterations = (!start && !offset && step === 1 && iterators.get(size)) || generate(size); // FFTIteration[];

      let i;

      const length = iterations.length,
        started = now();

      for (i = 0; i < length && callback(...iterations[i]) !== false; i++); // for (const iteration of iterations) if (/* iteration.remaining = remaining--, */ apply(iteration) === false) break;

      const ended = now(),
        elapsed = ended - started,
        operations = i,
        aborted = i < length - 1;

      debugging &&
        setTimeout(
          () =>
            console[aborted ? 'warn' : 'info'](
              `FFT: ▶︎ ${(size ** 0.5).toFixed(0)}² × ${(operations / 1000).toFixed(1)}k ops / ${elapsed.toFixed(1)}ms`,
            ),
          0,
        );

      return iterations;
    }
  }

  (iterate as any) = Object.assign(iterate.iterate, iterate);

  export declare interface Operation {
    uid?: any;

    aborted?: boolean;
  }
  export declare interface Operations {
    [name: string]: Operation;
  }
  const operations: Operations = {};

  // export function transform($in: TypedArray, $out: Float32Array | Float64Array, direction: 'forward' | 'inverse', operation: { abort?: boolean } = {}): boolean {
  /**
   * Fourier Transform/Inverse Pairs:
   *  Given   f(x) <=> F(u)
   *      let     F(u) = ∫ f(x) * e ** -j2πux dx;
   *
   *              f(x) = ∫ F(u) * e ** j2πux du;
   *
   *      where   x = -∞ … ∞ in the 1D spatial coordinates domain
   *              u = -∞ … ∞ in the respective spatial frequency domain
   *              j = √-1
   *
   *  Given   f(x,y) <=> F(u,v)
   *      let     F(u,v) = ∫∫ f(x,y) * e ** -j2π(ux+vy) dx dy;
   *
   *              f(x,y) = ∫∫ F(u,v) * e ** j2π(ux+vy)  du dv;
   *
   *      where   x & y = -∞ … ∞ in orthogonal 2D spatial coordinates domains
   *              u & v = -∞ … ∞ in the respective spatial frequency domains
   *
   * @see http://www.csc.kth.se/utbildning/kth/kurser/DD2422/bildat08/report_FFT.pdf
   * @see http://www.robots.ox.ac.uk/~az/lectures/ia/lect2.pdf
   */
  export function transform(
    $in: TypedArray,
    $out: TypedArray,
    direction: 'forward' | 'inverse',
    operation: Operation = {aborted: false},
  ): boolean {
    const forward = direction === 'forward',
      sign = forward ? 1 : -1,
      PIt = PI2;

    const validData = $in && $in.length > 0 && $out && $out.length > 0;

    const fromReal = validData && $in.length === $out.length / 2,
      fromComplex = validData && $in.length === $out.length;

    const size = fromReal ? $in.length : fromComplex ? $in.length / 2 : 0;

    const cis = cisTables(size),
      [n, n2, n4, n8] = cis.n;

    if (!size || !(validData && (fromReal || fromComplex))) return false;

    const integrate: (size: number, start: number, offset: number) => boolean = (size, start, offset) => {
      const length = size / 2,
        end = start + length,
        d = n / size; // const twiddle = PIt / size;

      // Cooley-Tukey decimation-in-time radix-2 FFT
      for (
        let k = start, h = 0, k1, k2, r1, i1, r2, i2, rt, it, rk, ik;
        ((k1 = imul(k, 2)),
        (k2 = imul(k + length, 2)),
        (r1 = $out[k1]),
        (i1 = $out[k1 + 1]),
        (r2 = $out[k2]),
        (i2 = $out[k2 + 1]),
        (rt = cis[h + n4]),
        (it = sign * cis[h]),
        (rk = (r2 || i2) && r2 * rt + i2 * it),
        (ik = (r2 || i2) && -r2 * it + i2 * rt)),
          k < end;
        k++, h += d
      )
        ($out[k1] += rk), ($out[k1 + 1] += ik), ($out[k2] = r1 - rk), ($out[k2 + 1] = i1 - ik);

      return true;
    };

    const translate: (start: number, offset: number) => boolean = fromReal
      ? (start, offset) => (($out[start * 2] = $in[offset] || 0), ($out[start * 2 + 1] = 0), true)
      : fromComplex
      ? (start, offset) => (
          ($out[start * 2] = $in[offset * 2] || 0), ($out[start * 2 + 1] = $in[offset * 2 + 1] || 0), true
        )
      : (start, offset) => false;

    const aggregate = (size, start, offset) =>
      !operation.aborted && (size === 1 ? translate(start, offset) : size > 1 ? integrate(size, start, offset) : false);

    return iterate({size}, aggregate), true;
  }

  declare const globalThis: Worker;

  if ('onmessage' in globalThis) {
    globalThis.onmessage = (
      event: MessageEvent & {
        data: {
          action?: string;
          input?: TypedData<RealData | ComplexData>;
          output?: TypedData<MutableData<RealData | ComplexData>>;
          buffer?;
          uid?;
        };
      },
    ) => {
      // tslint:disable-next-line:prefer-const
      const {data = {} as any} = event;

      if (data.action === 'forward' || data.action === 'inverse') {
        const {
          action: direction,
          input,
          output = direction === 'inverse'
            ? new Float32Array(new SharedArrayBuffer(input.length * 4))
            : new Float32Array(new SharedArrayBuffer(input.length * 4 * 2)),
        } = data;

        if (data.action === 'forward') for (const _uid in operations) operations[_uid].aborted = true;

        const operation = {uid: data.uid, aborted: false};

        operations[data.uid] = operation;

        const done = transform(input, output, direction, operation);

        delete operations[data.uid];

        const reply = {uid: data.uid, input, output, done};

        globalThis.postMessage(reply, transferables(input.buffer, output.buffer));
      } else if (data.action === 'preGenerate') {
        if (data.size > 0) iterate.generate(data.size as number);
      } else if (data.action === 'abort') {
        if (data.uid in operations) (operations[data.uid].aborted = true), delete operations[data.uid];
      } else {
        console.error(`Unsupported operation`, event);
      }
    };
  }
}
