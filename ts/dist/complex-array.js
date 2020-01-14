// @ts-nocheck
import Complex from './complex.js';
import initializeData from './data.js';

class ComplexArray {
    constructor(parameter, store = Float32Array) {
        this.allocations = [];
        const data = parameter > 0 ? new store(parameter * 2) : parameter;
        if (!data || !(data instanceof store))
            throw Error('ComplexArray requires either a positive size value or a double-sized Float64Array as the first argument.');
        this.data = data;
        this.values = new Array(this.length);
        initializeData(this);
    }
    get length() {
        return this.data && this.data.length / 2;
    }
    get(i) {
        return this.allocate(i);
    }
    set(i, value, { real = 0, imag = 0 } = value || {}) {
        (this.data[i * 2] = real), (this.data[i * 2 + 1] = imag);
        this.allocate(i);
    }
    create(i, value = new ComplexCell(this, i)) {
        return (this.values[i] = value), value;
    }
    allocate(i, value = this.values[i]) {
        return value || this.create(i);
    }
    unallocate({ allocations, values } = this) {
        return;
    }
}
class ComplexCell extends Complex {
    constructor(array, index = NaN) {
        super();
        this.array = array;
        this.index = index;
    }
    get data() {
        return this.array.data;
    }
    get real() {
        return this.data[this.index * 2];
    }
    set real(real) {
        this.data[this.index * 2] = real;
    }
    get imag() {
        return this.data[this.index * 2 + 1];
    }
    set imag(imag) {
        this.data[this.index * 2 + 1] = imag;
    }
    get _magnitude2() {
        return Complex.magnitude2(this.data[this.index * 2], this.data[this.index * 2 + 1]);
    }
    get magnitude() {
        const magnitude2 = Complex.magnitude2(this.data[this.index * 2], this.data[this.index * 2 + 1] || 0);
        return Math.sqrt(magnitude2);
    }
}

export default ComplexArray;
export { ComplexArray, ComplexCell };
//# sourceMappingURL=complex-array.js.map
