// @ts-nocheck
class AbstractData {
    get(i) { return this[i]; }
    set(i, value) { this[i] = value; }
}
const getSuperConstructor = (Type, ...args) => Object.getPrototypeOf(Object.getPrototypeOf(new Type(...args.length ? args : [1])).constructor);
const TypedArray = getSuperConstructor(Uint8Array);
const stringTag = (object) => Object.prototype.toString.call(object);
class TypedArrayData extends AbstractData {
    get(i) { return this[i]; }
    set(i, value) { this[i] = value; }
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
function initialize(data) {
    if (!data || typeof data !== 'object')
        throw ReferenceError(`Cannot initialize data from ${/^[aeiou]/.test(typeof data) ? 'an' : 'a'} ${typeof data} value!`);
    if (data[IS_DATA_OBJECT] = data[IS_DATA_OBJECT] || 'get' in data && 'set' in data && typeof data['get'] === 'function' && typeof data['set'] === 'function') ;
    else if (typeof data['get'] === 'function' && typeof data['set'] === 'function') {
        console.warn(`Blocked an attempt to initialize data from an object that defines both get and set methods to avoid potential conflicts with non-data-related implementations!`);
    }
    else {
        if (data instanceof TypedArray) {
            Object.defineProperties(data, typedArrayDataDescriptors);
        }
        else if (Array.isArray(data)) {
            data['get'] = AbstractData.prototype.get;
            data['set'] = AbstractData.prototype.set;
        }
        else
            throw TypeError(`Cannot initialize data from ${stringTag(data)} instance!`);
        data[IS_DATA_OBJECT] = true;
    }
    return data;
}

export default initialize;
export { TypedArray, getSuperConstructor, initialize, stringTag };
//# sourceMappingURL=data.js.map
