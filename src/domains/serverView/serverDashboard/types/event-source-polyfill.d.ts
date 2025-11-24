import "event-source-polyfill";

declare module "event-source-polyfill" {
  interface EventSourcePolyfill {
    addEventListener(
      type: string,
      listener: (event: MessageEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void;

    removeEventListener(
      type: string,
      listener: (event: MessageEvent) => void,
      options?: boolean | EventListenerOptions
    ): void;
  }
}
