/// <reference path="../src/types/types.d.ts" />
declare namespace FFT {
    const transferableTypes: (ArrayBufferConstructor | (new (image: HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | ImageData | Blob, ...args: any[]) => ImageBitmap) | {
        new (): MessagePort;
        prototype: MessagePort;
    })[];
    const transferables: <T extends object>(...objects: T[]) => T[];
    interface Operation {
        uid?: any;
        aborted?: boolean;
    }
    interface Operations {
        [name: string]: Operation;
    }
    function transform($in: TypedArray, $out: TypedArray, direction: 'forward' | 'inverse', operation?: Operation): boolean;
}
