/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// SEE: https://github.com/airbnb/lunar/blob/master/types/global.d.ts
export type RequestIdleCallbackOptions = {
  timeout: number;
};

// SEE: https://github.com/airbnb/lunar/blob/master/types/global.d.ts
export type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining(): number;
};

declare global {
  interface Window {
    // SEE: https://github.com/airbnb/lunar/blob/master/types/global.d.ts
    requestIdleCallback(
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ): number;
    // SEE: https://github.com/airbnb/lunar/blob/master/types/global.d.ts
    cancelIdleCallback(handle: number): void;
  }

  var requestIdleCallback: Window['requestIdleCallback'];
  var cancelIdleCallback: Window['cancelIdleCallback'];
}
