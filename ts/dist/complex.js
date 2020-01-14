// @ts-nocheck
import { diagonal } from './math.js';

const dud = { real: 0, imag: 0 };
const times = ({ real: r1, imag: i1 } = dud, { real: r2, imag: i2 } = dud) => new Complex(r1 * r2 - i1 * i2, r1 * i2 + i1 * r2);
const plusTimes = ({ real: r1, imag: i1 } = dud, { real: r2, imag: i2 } = dud, { real: r3, imag: i3 } = dud) => new Complex(r1 + (r2 * r3 - i2 * i3), i1 + (r2 * i3 + i2 * r3));
const minusTimes = ({ real: r1, imag: i1 } = dud, { real: r2, imag: i2 } = dud, { real: r3, imag: i3 } = dud) => new Complex(r1 - (r2 * r3 - i2 * i3), i1 - (r2 * i3 + i2 * r3));
const plusTimesSet = (c, { real: r2, imag: i2 } = dud, { real: r3, imag: i3 } = dud) => {
    const { real: r1, imag: i1 } = c;
    const r = (c.real = r1 + (r2 * r3 - i2 * i3)), i = (c.imag = i1 + (r2 * i3 + i2 * r3));
    c._magnitude2 = magnitude2(r, i);
    delete c._magnitude;
    return c;
};
const minusTimesSet = (c, { real: r2, imag: i2 } = dud, { real: r3, imag: i3 } = dud) => {
    const { real: r1, imag: i1 } = c;
    const r = (c.real = r1 - (r2 * r3 - i2 * i3)), i = (c.imag = i1 - (r2 * i3 + i2 * r3));
    c._magnitude2 = magnitude2(r, i);
    delete c._magnitude;
    return c;
};
const magnitude2 = (real, imag) => real * real + imag * imag || 0;
class Complex {
    constructor(real, imag) {
        if (arguments.length > 0)
            this._magnitude2 = magnitude2((this.real = real), (this.imag = imag || 0));
    }
    static computeMagnitude2({ _magnitude2 = NaN, real, imag } = this) {
        return isNaN(_magnitude2) ? (this._magnitude2 = real * real + imag * imag || 0) : _magnitude2;
    }
    static computeMagnitude({ _magnitude = NaN, _magnitude2 } = this) {
        return isNaN(_magnitude) ? (this._magnitude = _magnitude2 ? Math.sqrt(_magnitude2) : 0) : _magnitude;
    }
    get magnitude2() {
        return this._magnitude2;
    }
    get magnitude() {
        return '_magnitude' in this ? this._magnitude : (this._magnitude = Math.sqrt(this.magnitude2));
    }
    plus(z) {
        return new Complex(this.real + z.real, this.imag + z.imag);
    }
    subtract(z) {
        (this.real = this.real - z.real), (this.imag = this.imag - z.imag);
    }
    minus(z) {
        return new Complex(this.real - z.real, this.imag - z.imag);
    }
    times(z) {
        return typeof z === 'object' ? times(this, z) : new Complex(z * this.real, z * this.imag);
    }
    getMagnitude() {
        return diagonal(this.real || 0, this.imag || 0);
    }
}
Complex.plusTimes = plusTimes;
Complex.minusTimes = minusTimes;
Complex.plusTimesSet = plusTimes;
Complex.minusTimesSet = minusTimes;
Complex.magnitude2 = magnitude2;

export default Complex;
export { Complex, dud, magnitude2, minusTimes, minusTimesSet, plusTimes, plusTimesSet, times };
//# sourceMappingURL=complex.js.map
