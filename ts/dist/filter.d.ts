/// <reference path="../src/types/types.d.ts" />
export declare const parseFilterRange: ({ lowBand, highBand, low, high, noLow, noHigh, sameBand, size, radius, }?: FilterParameters) => {
    lowBand: number;
    highBand: number;
    sameBand: boolean;
    low: number;
    high: number;
    noLow: boolean;
    noHigh: boolean;
    size: number;
    radius: number;
};
export declare function gaussian(x: number, mean: number, sigma: number): number;
export declare namespace gaussian {
    const twiddle: number;
    const gaussian: (χ: number, α: number, σ: number, δ?: number, ω?: number) => number;
}
export declare function filter(dimensions?: Dimensions | number, lowPass?: Band, highPass?: Band, options?: FilterOptions): any;
export declare function filter(data: Data<any>, lowPass?: Band, highPass?: Band, options?: FilterOptions): any;
export default filter;
