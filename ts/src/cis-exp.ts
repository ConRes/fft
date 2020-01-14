import {round, mround, trunc, ceil} from './math';
import {Complex} from './complex';

// tslint:disable:no-bitwise prefer-object-spread

namespace cisTables {
  const {PI, abs, sin, cos, sqrt, max} = Math; // const abs = (value: number) => value * ((value >= 0 || -1) as number);
  const Base = Float32Array;
  /**
   * CIS Lookup Table for s₏ sin(2πn/N) and c₏ for cos(2πn/N) terms, where N
   * is a base-2 single-term safe unsigned integer (2ⁿ) passed as the first
   * constructor argument for the table.
   *
   * @see https://en.wikipedia.org/wiki/Trigonometric_tables
   */
  export class CISTable extends (Base as typeof Base) {
    // private n: number; private n2: number; private n4: number; private n8: number;
    n: [number, number, number, number];
    constructor(public size: number) {
      super(new SharedArrayBuffer(Base.BYTES_PER_ELEMENT * (size * 1.25)));
      const [n, n2, n4, n8] = (this.n = [size, size >> 1, size >> 2, size >> 3]);
      const t = sin(PI / n),
        c0 = (this[n4] = 1),
        s0 = (this[0] = 0),
        n2p4 = n2 + n4;
      const dc0 = 2 * t ** 2,
        ds0 = max((2 - dc0) * dc0) ** 0.5,
        t0 = 2 * dc0;

      const sequential = !true;
      if (sequential) {
        for (let x = 0, [dc, ds, t, c, s] = [dc0, ds0, t0, c0, s0]; x < n; x++) {
          if (x > 1 && x < n8) {
            this[x] = s += ds;
            ds -= t * s;
            this[n4 - x] = c -= dc;
            dc += t * s;
          } else if (x > n4 - n8 && x < n4 - 1) {
          } else if (x === n8) {
            if (n8 !== 0) this[x] = Math.sqrt(0.5);
          }

          // const j0 = n2 - n4, jN = n2 - 0;
          // if (x > j0 && x <= jN) {
          //     const j = jN - x;
          //     this[x] = this[j];
          // }
          // const k0 = n2 + 0, kN = n2 + n2p4;
          // if (x >= n2 && x < n2 + n2p4) {
          //     const k = x - k0;
          //     this[x] = -this[k];
          // }
          // return this[x];
        }
        // for (let j = 0; j < n4; j++) this[n2 - j] = this[j]; // lim = n4
        for (let j = n2; j > n2 - n4; j--) this[j] = this[n2 - j];
      } else {
        for (
          let i = 1, [dc, ds, t, c, s] = [dc0, ds0, t0, c0, s0];
          i < n8;
          i++ // dc = dc0, ds = ds0, t = t0, c = c0, s = s0; // c -= dc, dc += t * c, s += ds, ds -= t * s,
        )
          (this[i] = s += ds), (ds -= t * s), (this[n4 - i] = c -= dc), (dc += t * c); // c -= dc, dc += t * c, s += ds, ds -= t * s, this[i] = s, this[n4 - i] = c;
        if (n8 !== 0) this[n8] = 0.5 ** 0.5; // ** 0.5;
        for (let j = 0; j < n4; j++) this[n2 - j] = this[j]; // lim = n4
        for (let k = 0; k < n2p4; k++) this[n2 + k] = -this[k]; // lim = n2 + n4
      }
    }
  }
  const tables = new Map<number, CISTable>();
  export const get = (size: number) => (!tables.has(size) && tables.set(size, new CISTable(size)), tables.get(size));
}

declare function cisTables(size: number): cisTables.CISTable;
(cisTables as any) = Object.assign(cisTables.get, cisTables);
globalThis['cisTables'] = cisTables;

export {cisTables};

export namespace cisExp {
  const {PI, abs, sin, cos} = Math; // const abs = (value: number) => value * ((value >= 0 || -1) as number);

  const period = PI * 2,
    significance = PI * 64;
  const length = ceil(period * significance * 2) * 2;
  export const buffer = new SharedArrayBuffer(length * 4);
  const table = new Float32Array(buffer).fill(-Infinity);

  export const create = x => [cos(x), sin(x)];
  export const get = (
    x,
    xt = ~~(((x % period) + period) * significance),
    i = xt * 2,
    ei = table[i],
    ej = table[i + 1],
  ) => (ei !== -Infinity || ((table[i] = ei = cos((x = xt / significance))), (table[i + 1] = ej = sin(x))), [ei, ej]);
}

export declare function cisExp(x: number): [number, number];
(cisExp as any) = Object.assign(cisExp.get, cisExp);

// const period = PI2, significance = PI64;
// const table = new Float32Array(ceil(period * significance * 2) * 2).fill(-Infinity);

// export const create = (x) => [cos(x), sin(x)];
// export const cisExp = (x, xt = ~~(((x % period) + period) * significance), i = xt * 2, ei = table[i], ej = table[i + 1]) => (
//     ei !== -Infinity || (table[i] = ei = cos(x = xt / significance), table[i + 1] = ej = sin(x)), [ei, ej]
// );

export default cisExp;

// const cisExpA = (x) => [cos(x), sin(x)];
// const cisExpO = (x) => new Complex(cos(x), sin(x));

// const cisExpsM = new Map<number, any>();
// const cisExpM = (x, xp = mround(x % PI4, PI64), exp = cisExpsM.get(xp)) => (!exp && (exp = cisExpA(xp / PI64), cisExpsM.set(xp, exp)), exp);

// // const cisExpsT = new Float32Array(ceil(PI4 * PI64) * 2);
// // const cisExpT = (x, xt = ~~((x % PI4) * PIn), i = xt * 2, exp = cisExpsT[i]) => (!exp && cisExpsT.set(cisExpA(xt / PIn), i), [cisExpsT[i], cisExpsT[i + 1]]);
// const PImod = PI2, PIround = PI64;
// const cisExpsT = new Float32Array(ceil(PImod * PIround * 2) * 2);
// const cisExpT = (x, xt = ~~(((x % PImod) + PImod) * PIround), i = xt * 2, exp = cisExpsT[i]) => (!exp && cisExpsT.set(cisExpA((xt / PIround) - PImod), i), [cisExpsT[i], cisExpsT[i + 1]]);
// // const cisExpT = (x, xt = ~~(((x % PI4) + PI4) * PI64), i = (xt * 2), exp = cisExpsT[i]) => (!exp && cisExpsT.set(cisExpA((xt / PI64) - PI4), i), [cisExpsT[i], cisExpsT[i + 1]]);

// // const cast = (value) => (cast['array'][0] = abs(value), cast['array'][0]); cast['array'] = new Uint16Array(1);
// const cast = Object.assign((value) => (cast['array'][0] = value, cast['array'][0]), { array: new Uint16Array(1) });
// const cisExpsC = new Float32Array(ceil(PI4 * PI64) * 2);
// const cisExpC = (x, xc = cast((x % PI4) * PI64), i = xc * 2, exp = cisExpsC[i]) => (!exp && cisExpsC.set(cisExpA(xc / PI64), i), [cisExpsC[i], cisExpsC[i + 1]]);

// export const cisExp: (value: number) => [number, number] = cisExpT as any; // () => [0, 0];
// export default cisExp;

// function testCisExp() {
//     console.info('testCisExp: started');
//     cisExpsM.clear();
//     cisExpsT.fill(null, 0, cisExpsT.length);
//     cisExpsC.fill(null, 0, cisExpsC.length);

//     const dimensions = [256, 1024, 2048, 4096];
//     const methods = { array: cisExpA, complex: cisExpO, ['map/mround']: cisExpM, ['table/cast']: cisExpC, ['table/trunc']: cisExpT }; // as Array<(value: number) => any>;
//     const totals: { [name: string]: number } = {};
//     const cycles: object[] = [];
//     const tround = (value: number) => mround(value || 0, 20);
//     let ids = Object.keys(methods).sort().reverse();
//     for (const dimension of dimensions) {
//         const size = dimension ** 2;
//         for (let n = 0; n < 4; n++) {
//             const cycle = { size };
//             totals.size = (totals.size || 0) + size;
//             for (const id of (ids = ids.reverse())) {
//                 const method = methods[id];
//                 const start = performance.now();
//                 for (let k = 0; k < size; k++) method(k); // for (let m = 0; m < reps; m++)
//                 const elapsed = performance.now() - start;
//                 cycle[id] = tround(elapsed), totals[id] = (totals[id] || 0) + elapsed;
//             }
//             cycles.push(cycle);
//         }
//     }
//     for (const id of (ids = ids.reverse())) totals[id] = tround(totals[id]);
//     const results = { ...cycles.reduce((cycles: any, cycle, i) => (cycles[`${i + 1}`.padStart(2, '0')] = cycle, cycles), {}), totals };
//     console.group('testCisExp');
//     console.table(results), console.log(methods, totals);
//     console.log({ cisExpsT, cisExpsC });
//     console.groupEnd();
//     console.info('testCisExp: complete');
// }

// // setTimeout(testCisExp, 5000);

// // const PI2 = Math.PI * 2, PI4 = Math.PI * 4, PI42 = PI4 * PI4; const cisExps = new Map<number, Complex>();
// // const cisExp = (x, xp = mround(x % PI4, PI42), exp = cisExps.get(xp)) => (!exp && (exp = new Complex(Math.cos(xp), Math.sin(xp)), cisExps.set(xp, exp)), exp);

// // const cisExp4t = (x, xt = trunc((x % PI4) * PI42), axt = xt < 0 ? xt * -1 : xt, exp = cisExps4t[axt * 2]) => (!exp && cisExps4t.set([Math.cos(x = axt / PI42), Math.sin(x)], axt * 2), [cisExps4t[axt * 2], cisExps4t[axt * 2 + 1]]);
// // const cisExp4t = (x, xt = trunc((x % PI4) * PI42) * ((x >= 0 || -1) as number), exp = cisExps4t[xt * 2]) => (!exp && cisExps4t.set([Math.cos(x = xt / PI42), Math.sin(x)], xt * 2), [cisExps4t[xt * 2], cisExps4t[xt * 2 + 1]]);
// // const cisExp4t = (x, xt = trunc((x % PI4) * PI42) * ((x >= 0 || -1) as number), i = xt * 2, exp = cisExps4t[i]) => (!exp && cisExps4t.set([Math.cos(x = xt / PI42), Math.sin(x)], i), cisExps4t.slice(i, i + 2));
