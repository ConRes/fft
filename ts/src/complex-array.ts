/// <reference path='./types/types.d.ts' />
/// <reference path='./types/window.d.ts' />

import Complex from './complex';
import initializeData from './data';

const {
  window: {requestIdleCallback, navigator: {hardwareConcurrency = 1} = {} as Window['navigator']} = {} as Window,
} = globalThis;

export declare type ComplexArrayStore = Int32Array | Int16Array | Int8Array | Float32Array | Float64Array | number[];
export declare type ComplexArrayStoreConstructor<T = ComplexArrayStore> = TypedArrayConstructor<ComplexArrayStore>;

export class ComplexArray<T extends ComplexArrayStore = ComplexArrayStore> implements Data<ComplexNumber> {
  public data: T; // private _data: T; get data(): T { return this._data; } set data(data: T) { this._data = data, this.unallocate(); }
  public values: Complex[];
  public allocations: number[] = [];

  constructor(data: T);
  constructor(length: number);
  constructor(parameter: number | T, store: ComplexArrayStoreConstructor = Float32Array) {
    const data = parameter > 0 ? (new store((parameter as number) * 2) as T) : parameter;
    if (!data || !(data instanceof store))
      throw Error(
        'ComplexArray requires either a positive size value or a double-sized Float64Array as the first argument.',
      );
    // this.scale = store === Int8Array ? 0.25 : 1;
    // @ts-ignore
    this.data = data;
    this.values = new Array(this.length);
    initializeData(this);
  }

  get length(): number {
    return this.data && this.data.length / 2;
  }

  get<U = ComplexNumber>(i: number): U {
    return (this.allocate(i) as any) as U;
  }

  // @ts-ignore
  set<U = ComplexNumber>(i: number, value: Complex, {real = 0, imag = 0} = value || {}) {
    (this.data[i * 2] = real), (this.data[i * 2 + 1] = imag);
    this.allocate(i);
    // if (value instanceof Complex) this.values[i] = value, this.allocate(i);
  }

  create(i: number, value = new ComplexCell(this, i)) {
    return (this.values[i] = value), value;
  }

  allocate(i: number, value = this.values[i]) {
    // const create = (i: number) => new Complex(this.data[i * 2], this.data[i * 2 + 1]);
    // return this.allocations.push(i), value || (this.values[i] = value = create(i), value);
    // const create = (i: number, value = new ComplexCell(this.data, i)) => (this.values[i] = value, value);
    return value || this.create(i);
  }

  unallocate({allocations, values} = this) {
    return;
    if (allocations && allocations.length)
      requestIdleCallback(() => {
        const _allocations = allocations.splice(0, allocations.length);
        for (const i of _allocations) delete values[i];
      });
  }
}

export declare type ComplexArrayData = ComplexArray['data'];

export class ComplexCell extends Complex {
  constructor(public array: ComplexArray, public index: number = NaN) {
    super();
  }
  get data(): ComplexArrayData {
    return this.array.data;
  }
  get real(): number {
    return this.data[this.index * 2];
  }
  set real(real: number) {
    this.data[this.index * 2] = real;
  }
  get imag(): number {
    return this.data[this.index * 2 + 1];
  }
  set imag(imag: number) {
    this.data[this.index * 2 + 1] = imag;
  }
  get _magnitude2() {
    return Complex.magnitude2(this.data[this.index * 2], this.data[this.index * 2 + 1]);
  }
  get magnitude() {
    const magnitude2 = Complex.magnitude2(this.data[this.index * 2], this.data[this.index * 2 + 1] || 0);
    return Math.sqrt(magnitude2);
    // return '_magnitude' in this ? this._magnitude : (this._magnitude = Math.sqrt(this.magnitude2));
  }
}

export default ComplexArray;

// export class ComplexCell extends Complex {
//     public array: ComplexArray;
//     public offset: number;
// }
