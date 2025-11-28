/**
 * @author 구희원
 * @description EventSourcePolyfill 타입 정의 확장
 */

import "event-source-polyfill";

/**
 * EventSourcePolyfill 모듈 타입 확장
 *
 * event-source-polyfill 라이브러리의 타입 정의를 확장하여
 * addEventListener 및 removeEventListener 메서드의 타입을 명시합니다.
 */
declare module "event-source-polyfill" {
  interface EventSourcePolyfill {
    /**
     * 이벤트 리스너 추가
     * @param type - 이벤트 타입
     * @param listener - 이벤트 리스너 함수
     * @param options - 리스너 옵션
     */
    addEventListener(
      type: string,
      listener: (event: MessageEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void;

    /**
     * 이벤트 리스너 제거
     * @param type - 이벤트 타입
     * @param listener - 이벤트 리스너 함수
     * @param options - 리스너 옵션
     */
    removeEventListener(
      type: string,
      listener: (event: MessageEvent) => void,
      options?: boolean | EventListenerOptions
    ): void;
  }
}
