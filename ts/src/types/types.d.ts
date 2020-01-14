declare interface ComplexNumber {
  real: number;
  imag: number;
  magnitude?: number;
}
declare type Dimensions = [number, number] & number[];
declare interface FilterOptions {
  fill?: number;
  clear?: number;
}
declare interface FilterParameters {
  sameBand?: boolean;
  lowBand?: number;
  highBand?: number;
  low?: number;
  high?: number;
  noLow?: boolean;
  noHigh?: boolean;
  size?: number;
  radius?: number;
}
declare interface FFTIteration {
  start?: number;
  offset?: number;
  size?: number;
  step?: number;
  remaining?: number | boolean;
  completed?: number | boolean;
  direction?: 'forward' | 'inverse';
}
declare type FFTIterations = FFTIteration[] & Partial<FFTIteration>;
declare type FFTIterator = IterableIterator<FFTIteration>;
declare type FFTOperation = (iteration: FFTIteration) => any;
declare namespace FFT {
  type Iteration = FFTIteration;
  type Iterations = FFTIterations;
  type Iterable = FFTIterator;
  type Callback = FFTOperation;
}
declare type Band = number;
declare type TypedArray<
  T = number,
  A =
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Float32Array
    | Float64Array
> = A;
declare type ArbitraryArray<T = number, A = T[] | TypedArray<T>> = A;
declare type DataLike<T = number | ComplexNumber> =
  | Data<T>
  | T[]
  | {[index: number]: T; length?: number}
  | TypedArray<T>;
declare interface Data<T = number | ComplexNumber> {
  // extends DataLike<T> {
  readonly length: number;
  outdated?: boolean;
  min?: number;
  max?: number;
  get?<U = T>(i: number): U | T;
  set?<U = T>(i: number, value: U | T): any;
  intrim?: any;
  progress?: number;
}
declare type ComplexDataLike = DataLike<ComplexNumber>; // | ComplexNumber[];
declare type ComplexData = Data<ComplexNumber>; // | ComplexNumber[];

declare type RealDataLike = DataLike<number>;
declare type RealData = Data<number>;

declare type MutableData<T extends Data> = Data<T> & {
  get<U = T>(i: number): U | T;
  set<U = T>(i: number, value: U | T): any;
};

declare type TypedData<T extends Data = Data, U extends TypedArray = TypedArray> = T & U;

declare type TypedConstructor<T = object> = new (...args: any[]) => T;
declare interface TypedArrayConstructor<T = TypedArray> {
  readonly prototype: T;
  new (length: number): T;
  new (array: ArrayLike<number>): T;
  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T;
}
