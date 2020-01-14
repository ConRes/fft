/// <reference path="../src/types/types.d.ts" />
/// <reference path="../src/types/window.d.ts" />
export declare type Iteration = [number, number, number, number];
export declare function generator(size?: number, start?: number, offset?: number, step?: number, iterations?: Iteration[]): Generator<Iteration, Iteration[], undefined>;
export declare function generate(size?: number, start?: number, offset?: number, step?: number): Iteration[];
export declare function iterate({ start, offset, size, step, remaining, completed }: FFTIteration, callback: (size?: number, start?: number, offset?: number, step?: number) => boolean): Iteration[];
export default iterate;
