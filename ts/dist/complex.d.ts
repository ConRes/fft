/// <reference path="../src/types/types.d.ts" />
export declare const dud: {
    real: number;
    imag: number;
};
export declare const times: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber) => Complex;
export declare const plusTimes: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
export declare const minusTimes: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
export declare const plusTimesSet: (c: Complex, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
export declare const minusTimesSet: (c: Complex, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
export declare const magnitude2: (real?: number, imag?: number) => number;
export declare class Complex implements ComplexNumber {
    static plusTimes: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
    static minusTimes: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
    static plusTimesSet: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
    static minusTimesSet: ({ real: r1, imag: i1 }?: ComplexNumber, { real: r2, imag: i2 }?: ComplexNumber, { real: r3, imag: i3 }?: ComplexNumber) => Complex;
    static magnitude2: (real?: number, imag?: number) => number;
    static computeMagnitude2(this: Complex, { _magnitude2, real, imag }?: Complex): number;
    static computeMagnitude(this: Complex, { _magnitude, _magnitude2 }?: Complex): number;
    _magnitude: number;
    _magnitude2: number;
    real: number;
    imag: number;
    constructor();
    constructor(real: number, imag?: number);
    get magnitude2(): number;
    get magnitude(): number;
    plus(z: any): Complex;
    subtract(z: any): void;
    minus(z: any): Complex;
    times(z: Complex | number): Complex;
    getMagnitude(): number;
}
export default Complex;
