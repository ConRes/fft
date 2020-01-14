declare namespace cisTables {
    const CISTable_base: Float32ArrayConstructor;
    export class CISTable extends CISTable_base {
        size: number;
        n: [number, number, number, number];
        constructor(size: number);
    }
    export const get: (size: number) => CISTable;
    export {};
}
declare function cisTables(size: number): cisTables.CISTable;
export { cisTables };
export declare namespace cisExp {
    const buffer: SharedArrayBuffer;
    const create: (x: any) => number[];
    const get: (x: any, xt?: number, i?: number, ei?: number, ej?: number) => number[];
}
export declare function cisExp(x: number): [number, number];
export default cisExp;
