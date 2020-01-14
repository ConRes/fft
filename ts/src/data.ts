/// <reference path='./types/types.d.ts' />

abstract class AbstractData<D extends DataLike<T>, T> implements Partial<Data<T>> {
    get<U = T>(this: D, i: number): U { return this[i]; }
    set<U = T>(this: D, i: number, value: U | T) { this[i] = value; }
}

export const getSuperConstructor = <T extends S, S extends TypedConstructor>(Type: T, ...args: any[]): S => Object.getPrototypeOf(Object.getPrototypeOf(new Type(...args.length ? args : [1])).constructor);
export const TypedArray = getSuperConstructor(Uint8Array) as TypedArrayConstructor;
export const stringTag = (object: any): string => Object.prototype.toString.call(object);

abstract class TypedArrayData<D extends DataLike<T>, T> extends AbstractData<D, T> implements Partial<Data<T>> {
    get<U = T>(this: D, i: number): U { return this[i]; }
    set<U = T>(this: D, i: number, value: U) { this[i] = value; }
    // set<U = T>(this: D, i: number, value: U) { (this.constructor.prototype as TypedArray).set.call(this, [value] as any, i); }
    // set<U = T>(this: D, i: number, value: U) { (super.set as any).call(this, [value] as any, i); }
    // set<U = T>(this: D, i: number, value: U) { this['_set'].call(this, [value], i); } // (this.constructor.prototype as TypedArray).set.call(this, value as any, i); }
    // set<U = T>(this: D, i: number, value: U) { this['_set'].call(this, [value], i); } // (this.constructor.prototype as TypedArray).set.call(this, value as any, i); }
}

const [writable, configurable] = [true, true];

const abstractDataDescriptors = {
    get: { writable, value: AbstractData.prototype.get },
    set: { writable, value: AbstractData.prototype.set },
};

const typedArrayDataDescriptors = {
    get: { writable, value: TypedArrayData.prototype.get },
    set: { writable, value: TypedArrayData.prototype.set },
};

const IS_DATA_OBJECT = Symbol('[[IS_DATA_OBJECT]]');

export function initialize<D extends DataLike<T>, T>(data: D) { // : D & Data<T> {
    if (!data || typeof data !== 'object') throw ReferenceError(`Cannot initialize data from ${/^[aeiou]/.test(typeof data) ? 'an' : 'a'} ${typeof data} value!`);
    if (data[IS_DATA_OBJECT] = data[IS_DATA_OBJECT] || 'get' in data && 'set' in data && typeof data['get'] === 'function' && typeof data['set'] === 'function') {
        // assuming previously initialized or compatible type
    } else if (typeof data['get'] === 'function' && typeof data['set'] === 'function') {
        console.warn(`Blocked an attempt to initialize data from an object that defines both get and set methods to avoid potential conflicts with non-data-related implementations!`);
    } else {
        if (data instanceof TypedArray) {
            // data['_set'] = data.set;
            Object.defineProperties(data, typedArrayDataDescriptors);
        } else if (Array.isArray(data)) {
            data['get'] = AbstractData.prototype.get; // .bind(data);
            data['set'] = AbstractData.prototype.set; // .bind(data);
        } else throw TypeError(`Cannot initialize data from ${stringTag(data)} instance!`);
        data[IS_DATA_OBJECT] = true;
    }

    return data as D & Data<T>;
}

export default initialize;
