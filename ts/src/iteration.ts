/// <reference path='./types/types.d.ts' />
/// <reference path='./types/window.d.ts' />

export type Iteration = [number, number, number, number];

const {
  window: {requestIdleCallback, navigator: {hardwareConcurrency = 1} = {} as Window['navigator']} = {} as Window,
} = globalThis;

const now =
  typeof performance !== 'undefined' && performance.now ? performance.now.bind(performance) : Date.now.bind(Date);

export function* generator(size = 0, start = 0, offset = 0, step = 1, iterations?: Iteration[]) {
  const yields = !iterations,
    nextSize = size >> 1,
    nextStep = step << 1,
    nextStart = start + nextSize,
    nextOffset = offset + step; // tslint:disable-line:no-bitwise
  iterations = iterations || [];

  size > 1 &&
    (generator(nextSize, start, offset, nextStep, iterations).next(),
    generator(nextSize, nextStart, nextOffset, nextStep, iterations).next());

  size >= 1 && (iterations.push([size, start, offset, step]), yields && (yield* iterations));

  return iterations;
}

const iterators = new Map<number, Iteration[]>();

export function generate(size = 0, start = 0, offset = 0, step = 1): Iteration[] {
  let iterations: Iteration[];

  if (!start && !offset && step === 1) {
    if (iterators.has(size)) return iterators.get(size);

    const started = now();

    generator(size, start, offset, step, (iterations = [])).next();

    const ended = now();
    const elapsed = ended - started;

    requestIdleCallback(() =>
      console.info(`FFT: ▷ ${(size ** 0.5).toFixed(0)}² × ${iterations.length} ops / ${elapsed.toFixed(1)}ms`),
    );

    iterators.set(size, iterations);
  } else {
    iterations = Array.from(generator(size, start, offset, step)) as Iteration[];
  }
  return iterations;
}

const N128 = 128 ** 2,
  N256 = 256 ** 2,
  N512 = 512 ** 2,
  N1024 = 1024 ** 2,
  N2048 = 2048 ** 2;

export function iterate(
  {start = 0, offset = 0, size = 0, step = 1, remaining = true, completed = 0}: FFTIteration,
  callback: (size?: number, start?: number, offset?: number, step?: number) => boolean,
): Iteration[] {
  const iterations = (!start && !offset && step === 1 && iterators.get(size)) || generate(size); // FFTIteration[];

  let i;

  const length = iterations.length;
  const started = now();

  for (i = 0; i < length && callback(...iterations[i]) !== false; i++); // for (const iteration of iterations) if (/* iteration.remaining = remaining--, */ apply(iteration) === false) break;

  const ended = now(),
    elapsed = ended - started,
    operations = i,
    aborted = i < length - 1;

  requestIdleCallback(() =>
    console[aborted ? 'warn' : 'info'](
      `FFT: ▶︎ ${(size ** 0.5).toFixed(0)}² × ${(operations / 1000).toFixed(1)}k ops / ${elapsed.toFixed(1)}ms`,
    ),
  );

  return iterations;
}

const pregenerate = (size: number, timeout: number = size ** 0.5) =>
  new Promise((resolve, reject) =>
    requestIdleCallback(() => (console.log(`FFT: ⚡︎ ${(size ** 0.5).toFixed(0)}²`), resolve(generate(size))), {
      timeout,
    }),
  );

export default iterate;

// setTimeout(async (size = 1024) => ( // Promise.all([
//     await pregenerate(size ** 2),
//     await pregenerate((size = size * 2) ** 2),
//     await pregenerate((size = size * 2) ** 2),
//     true
// ), 5000);

// export function* iterations({ start = 0, offset = 0, size = 0, step = 1 }: FFTIteration = {}, result?): IterableIterator<FFTIteration> { // } = Array(size * 2 - 1))
//     // if (size > 1) {
//     //     const nextSize = size / 2, nextStep = 2 * step, nextStart = start + nextSize, nextOffset = offset + step;

//     //     yield* iteration({ start, offset, size: nextSize, step: nextStep } as FFTIteration);

//     //     yield* iteration({ start: nextStart, offset: nextOffset, size: nextSize, step: nextStep } as FFTIteration);

//     // } // else if (size === 1) yield { start, offset, size, step } as FFTIteration;

// }

// export function iterate({ start = 0, offset = 0, size = 0, step = 1, remaining = true, completed = 0 }: FFTIteration, apply: (iteration: FFTIteration) => any) {
// const iterator = fftIteration({ start, offset, size, step });

// const started = performance.now();

// for (let iteration = iterator.next(); !iteration.done && apply(iteration.value) || (remaining = !iteration.done); iteration = iterator.next(), (completed as number)++);

// const ended = performance.now(), elapsed = ended - started; // operations = i, aborted = i < length - 1;

// requestIdleCallback(() => (
//     console[remaining ? 'warn' : 'info'](`FFT: ▶︎ ${(size ** 0.5).toFixed(0)}² × ${((completed as number) / 1000).toFixed(1)}k ops / ${(elapsed).toFixed(1)}ms`) // { start, offset, size, step, elapsed, operations, aborted })
// ));

// }

// let lastIterator: FFTIteration & { iterator?: Iterable<FFTIteration>; iterations?: FFTIteration[] };

// export function applyFFT({ start = 0, offset = 0, size = 0, step = 1 }: FFTIteration, apply: (iteration: FFTIteration) => any) {
//     let aborted = false;  // iterations: FFTIteration[],
//     const reusable = ({ iterations = [], iterations: { length = 0 }, start: _start, offset: _offset, size: _size }: Partial<typeof lastIterator>) => length && (start === _start) && (offset === _offset) && (size === _size) || false;

//     if (lastIterator && reusable(lastIterator)) { // lastIterator.iterations && lastIterator.iterations.length && lastIterator.start === start && lastIterator.offset === offset && lastIterator.size === size && lastIterator.step === step) {
//         const iterations = lastIterator.iterations;

//         for (let i = 0; !aborted && i < iterations.length; i++) {
//             aborted = aborted || apply(iterations[i]) === false;

//         }
//         return iterations;

//     } else {
//         lastIterator = { start, offset, size, step };

//         const iterator = lastIterator.iterator = fftIteration(lastIterator), iterations = lastIterator.iterations = [];

//         for (const iteration of iterations) {
//             iterations.push(iteration), (aborted || (aborted = aborted || apply(iteration) === false));

//         }
//         return iterations;

//     }
//     // for (const iteration of iterations) apply(iteration);

// }
