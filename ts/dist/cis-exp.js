// @ts-nocheck
import { ceil } from './math.js';

var cisTables;
(function (cisTables) {
    const { PI, abs, sin, cos, sqrt, max } = Math;
    const Base = Float32Array;
    class CISTable extends Base {
        constructor(size) {
            super(new SharedArrayBuffer(Base.BYTES_PER_ELEMENT * (size * 1.25)));
            this.size = size;
            const [n, n2, n4, n8] = (this.n = [size, size >> 1, size >> 2, size >> 3]);
            const t = sin(PI / n), c0 = (this[n4] = 1), s0 = (this[0] = 0), n2p4 = n2 + n4;
            const dc0 = 2 * t ** 2, ds0 = max((2 - dc0) * dc0) ** 0.5, t0 = 2 * dc0;
            {
                for (let i = 1, [dc, ds, t, c, s] = [dc0, ds0, t0, c0, s0]; i < n8; i++)
                    (this[i] = s += ds), (ds -= t * s), (this[n4 - i] = c -= dc), (dc += t * c);
                if (n8 !== 0)
                    this[n8] = 0.5 ** 0.5;
                for (let j = 0; j < n4; j++)
                    this[n2 - j] = this[j];
                for (let k = 0; k < n2p4; k++)
                    this[n2 + k] = -this[k];
            }
        }
    }
    cisTables.CISTable = CISTable;
    const tables = new Map();
    cisTables.get = (size) => (!tables.has(size) && tables.set(size, new CISTable(size)), tables.get(size));
})(cisTables || (cisTables = {}));
cisTables = Object.assign(cisTables.get, cisTables);
globalThis['cisTables'] = cisTables;
var cisExp;
(function (cisExp) {
    const { PI, abs, sin, cos } = Math;
    const period = PI * 2, significance = PI * 64;
    const length = ceil(period * significance * 2) * 2;
    cisExp.buffer = new SharedArrayBuffer(length * 4);
    const table = new Float32Array(cisExp.buffer).fill(-Infinity);
    cisExp.create = x => [cos(x), sin(x)];
    cisExp.get = (x, xt = ~~(((x % period) + period) * significance), i = xt * 2, ei = table[i], ej = table[i + 1]) => (ei !== -Infinity || ((table[i] = ei = cos((x = xt / significance))), (table[i + 1] = ej = sin(x))), [ei, ej]);
})(cisExp || (cisExp = {}));
cisExp = Object.assign(cisExp.get, cisExp);

export { cisExp, cisTables };
//# sourceMappingURL=cis-exp.js.map
