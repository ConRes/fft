/// <reference path="../src/types/types.d.ts" />
export declare const getSuperConstructor: <T extends S, S extends TypedConstructor<object>>(Type: T, ...args: any[]) => S;
export declare const TypedArray: TypedArrayConstructor<Float32Array | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float64Array>;
export declare const stringTag: (object: any) => string;
export declare function initialize<D extends DataLike<T>, T>(data: D): D & Data<T>;
export default initialize;
