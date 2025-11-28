/**
 * @author 구희원
 * @description Circle 컴포넌트 관련 타입 정의
 */

/**
 * @typedef CircleSize
 * @description Circle의 크기 옵션
 * @type {"small" | "medium"}
 */
export type CircleSize = "small" | "medium";

/**
 * @typedef CircleGradient
 * @description Circle의 색상 그라디언트 옵션
 * @type {"blue" | "purple" | "orange" | "yellow" | "pink" | "green"}
 */
export type CircleGradient =
  | "blue"
  | "purple"
  | "orange"
  | "yellow"
  | "pink"
  | "green";

/**
 * @interface CircleConfig
 * @description Circle 컴포넌트 렌더링을 위한 설정 객체
 * @property {string} id - Circle 고유 식별자
 * @property {CircleSize} size - Circle 크기
 * @property {CircleGradient} gradient - Circle 색상 그라디언트
 * @property {string} position - Circle 위치(CSS position 클래스)
 */
export interface CircleConfig {
  id: string;
  size: CircleSize;
  gradient: CircleGradient;
  position: string;
}
