/// <reference path="../src/types/types.d.ts" />
/// <reference path="../src/types/window.d.ts" />
import Complex from './complex';
export declare type ComplexArrayStore = Int32Array | Int16Array | Int8Array | Float32Array | Float64Array | number[];
export declare type ComplexArrayStoreConstructor<T = ComplexArrayStore> = TypedArrayConstructor<ComplexArrayStore>;
export declare class ComplexArray<T extends ComplexArrayStore = ComplexArrayStore> implements Data<ComplexNumber> {
    data: T;
    values: Complex[];
    allocations: number[];
    constructor(data: T);
    constructor(length: number);
    get length(): number;
    get<U = ComplexNumber>(i: number): U;
    set<U = ComplexNumber>(i: number, value: Complex, { real, imag }?: {}): void;
    create(i: number, value?: any): any;
    allocate(i: number, value?: Complex): any;
    unallocate({ allocations, values }?: this): void;
}
export declare type ComplexArrayData = ComplexArray['data'];
export declare class ComplexCell extends Complex {
    array: ComplexArray;
    index: number;
    constructor(array: ComplexArray, index?: number);
    get data(): ComplexArrayData;
    get real(): number;
    set real(real: number);
    get imag(): number;
    set imag(imag: number);
    get _magnitude2(): number;
    get magnitude(): number;
}
export default ComplexArray;
