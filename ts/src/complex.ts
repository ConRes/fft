/// <reference path='./types/types.d.ts' />

import {round, mround, trunc, diagonal} from './math';

export const dud = {real: 0, imag: 0};

export const times = ({real: r1, imag: i1}: ComplexNumber = dud, {real: r2, imag: i2}: ComplexNumber = dud): Complex =>
  new Complex(r1 * r2 - i1 * i2, r1 * i2 + i1 * r2);

export const plusTimes = (
  {real: r1, imag: i1}: ComplexNumber = dud,
  {real: r2, imag: i2}: ComplexNumber = dud,
  {real: r3, imag: i3}: ComplexNumber = dud,
): Complex => new Complex(r1 + (r2 * r3 - i2 * i3), i1 + (r2 * i3 + i2 * r3));

export const minusTimes = (
  {real: r1, imag: i1}: ComplexNumber = dud,
  {real: r2, imag: i2}: ComplexNumber = dud,
  {real: r3, imag: i3}: ComplexNumber = dud,
): Complex => new Complex(r1 - (r2 * r3 - i2 * i3), i1 - (r2 * i3 + i2 * r3));

export const plusTimesSet = (
  c: Complex,
  {real: r2, imag: i2}: ComplexNumber = dud,
  {real: r3, imag: i3}: ComplexNumber = dud,
): Complex => {
  const {real: r1, imag: i1}: ComplexNumber = c;
  const r = (c.real = r1 + (r2 * r3 - i2 * i3)),
    i = (c.imag = i1 + (r2 * i3 + i2 * r3));
  c._magnitude2 = magnitude2(r, i);
  delete c._magnitude;
  return c;
};

export const minusTimesSet = (
  c: Complex,
  {real: r2, imag: i2}: ComplexNumber = dud,
  {real: r3, imag: i3}: ComplexNumber = dud,
): Complex => {
  const {real: r1, imag: i1}: ComplexNumber = c;
  const r = (c.real = r1 - (r2 * r3 - i2 * i3)),
    i = (c.imag = i1 - (r2 * i3 + i2 * r3));
  c._magnitude2 = magnitude2(r, i);
  delete c._magnitude;
  return c;
};

export const magnitude2 = (real?: number, imag?: number) => real * real + imag * imag || 0;

// export const compute = (value: number, compute: (value) => any) => value === 0 ? value : value || compute(value);

export class Complex implements ComplexNumber {
  static plusTimes = plusTimes;
  static minusTimes = minusTimes;
  static plusTimesSet = plusTimes;
  static minusTimesSet = minusTimes;
  static magnitude2 = magnitude2;

  static computeMagnitude2(this: Complex, {_magnitude2 = NaN, real, imag}: Complex = this) {
    return isNaN(_magnitude2) ? (this._magnitude2 = real * real + imag * imag || 0) : _magnitude2;
  }

  static computeMagnitude(this: Complex, {_magnitude = NaN, _magnitude2}: Complex = this) {
    return isNaN(_magnitude) ? (this._magnitude = _magnitude2 ? Math.sqrt(_magnitude2) : 0) : _magnitude;
  }

  // _real: number; _imaginary: number;
  _magnitude: number;
  _magnitude2: number;
  real: number;
  imag: number;

  constructor();
  constructor(real: number, imag?: number);
  constructor(real?: number, imag?: number) {
    if (arguments.length > 0) this._magnitude2 = magnitude2((this.real = real), (this.imag = imag || 0));
  }

  get magnitude2() {
    return this._magnitude2;
  }
  get magnitude() {
    // @ts-ignore
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
  times(z: Complex | number) {
    return typeof z === 'object' ? times(this, z) : new Complex(z * this.real, z * this.imag);
  } // new Complex(this.real * z.real - this.imag * z.imag, this.real * z.imag + this.imag * z.real)

  getMagnitude() {
    // const magnitude2 = ;
    return diagonal(this.real || 0, this.imag || 0); // Math.sqrt(Complex.magnitude2(this.real || 0, this.imag || 0));
  }
}

export default Complex;
