// @ts-nocheck
const { window: { requestIdleCallback, navigator: { hardwareConcurrency = 1 } = {} } = {}, } = globalThis;
const now = typeof performance !== 'undefined' && performance.now ? performance.now.bind(performance) : Date.now.bind(Date);
function* generator(size = 0, start = 0, offset = 0, step = 1, iterations) {
    const yields = !iterations, nextSize = size >> 1, nextStep = step << 1, nextStart = start + nextSize, nextOffset = offset + step;
    iterations = iterations || [];
    size > 1 &&
        (generator(nextSize, start, offset, nextStep, iterations).next(),
            generator(nextSize, nextStart, nextOffset, nextStep, iterations).next());
    size >= 1 && (iterations.push([size, start, offset, step]), yields && (yield* iterations));
    return iterations;
}
const iterators = new Map();
function generate(size = 0, start = 0, offset = 0, step = 1) {
    let iterations;
    if (!start && !offset && step === 1) {
        if (iterators.has(size))
            return iterators.get(size);
        const started = now();
        generator(size, start, offset, step, (iterations = [])).next();
        const ended = now();
        const elapsed = ended - started;
        requestIdleCallback(() => console.info(`FFT: ▷ ${(size ** 0.5).toFixed(0)}² × ${iterations.length} ops / ${elapsed.toFixed(1)}ms`));
        iterators.set(size, iterations);
    }
    else {
        iterations = Array.from(generator(size, start, offset, step));
    }
    return iterations;
}
function iterate({ start = 0, offset = 0, size = 0, step = 1, remaining = true, completed = 0 }, callback) {
    const iterations = (!start && !offset && step === 1 && iterators.get(size)) || generate(size);
    let i;
    const length = iterations.length;
    const started = now();
    for (i = 0; i < length && callback(...iterations[i]) !== false; i++)
        ;
    const ended = now(), elapsed = ended - started, operations = i, aborted = i < length - 1;
    requestIdleCallback(() => console[aborted ? 'warn' : 'info'](`FFT: ▶︎ ${(size ** 0.5).toFixed(0)}² × ${(operations / 1000).toFixed(1)}k ops / ${elapsed.toFixed(1)}ms`));
    return iterations;
}

export default iterate;
export { generate, generator, iterate };
//# sourceMappingURL=iteration.js.map
