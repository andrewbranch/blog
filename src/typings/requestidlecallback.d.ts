// Type definitions for requestidlecallback 0.1
// Project: https://w3c.github.io/requestidlecallback/
// Definitions by: 贺师俊 <https://github.com/hax>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'requestidlecallback' {
  global {
    function requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): IdleCallbackHandle;
    function cancelIdleCallback(handle: IdleCallbackHandle): void;

    type IdleCallbackHandle = number;

    type IdleRequestCallback = (deadline: IdleDeadline) => void;

    interface IdleDeadline {
      timeRemaining(): DOMHighResTimeStamp;
      readonly didTimeout: boolean;
    }

    interface IdleRequestOptions {
      timeout: number;
    }
  }
}