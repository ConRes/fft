/// <reference path="../src/types/types.d.ts" />
/// <reference path="../src/types/window.d.ts" />
import { Complex } from './complex';
import filter from './filter';
import ComplexArray from './complex-array';
import initializeData from './data';
export declare const workers: {};
export declare const useWorkers: boolean;
export declare const outdated: (object: any) => boolean;
export declare const FFT: (input: DataLike<number>, output: DataLike<ComplexNumber>) => ComplexData;
export declare const IFFT: (input: DataLike<ComplexNumber>, output: DataLike<number>) => RealData;
export declare function transform($in: TypedArray, $out: TypedArray, direction: 'forward' | 'inverse'): boolean;
export declare function processForwardData(output: ComplexData, { length }?: {
    length?: number;
}): ComplexData;
export declare function processInverseData(intrim: ComplexData, output: MutableData<RealData | ComplexData>, { length, denominator }?: {
    length?: number;
    denominator?: any;
}): RealData;
declare const _default: {
    Complex: typeof Complex;
    ComplexArray: typeof ComplexArray;
    forward: (input: DataLike<number>, output: DataLike<ComplexNumber>) => ComplexData;
    inverse: (input: DataLike<ComplexNumber>, output: DataLike<number>) => RealData;
    filter: typeof filter;
    initializeData: typeof initializeData;
    outdated: (object: any) => boolean;
};
export default _default;
export { FFT as forward, IFFT as inverse, initializeData };
