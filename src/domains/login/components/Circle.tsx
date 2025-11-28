/**
 * @author 구희원
 * @description 애니메이션 원(Circle) 컴포넌트
 *
 * - 크기(size), 그라데이션(gradient), 위치(position)를 받아 원형 요소 생성
 * - Tailwind CSS 클래스와 커스텀 CSS 애니메이션(animate-twinkle-slow) 적용
 * - 배경 그라데이션은 지정된 컬러 팔레트 중 선택
 */

import type { CircleSize, CircleGradient } from "../types/circle";
import "../css/circle.css";

interface CircleProps {
  /** 원의 배경 그라데이션 */
  gradient: CircleGradient;

  /** 화면 내 위치 (Tailwind CSS 클래스 문자열) */
  position: string;

  /** 원의 크기 */
  size: CircleSize;
}

/** Circle 크기 매핑 */
const sizes: Record<CircleSize, string> = {
  small: "15vw",
  medium: "20vw",
};

/** Circle 그라데이션 색상 매핑 */
const gradients: Record<CircleGradient, string> = {
  blue: "linear-gradient(to right, #06b6d4, #14b8a6)",
  purple: "linear-gradient(to right, #4F39F6, #9810FA)",
  orange: "linear-gradient(to right, #f97316, #ec4899)",
  yellow: "linear-gradient(to right, #eab308, #f97316)",
  pink: "linear-gradient(to right, #ec4899, #a855f7)",
  green: "linear-gradient(to right, #10b981, #06b6d4)",
};

/**
 * Circle 컴포넌트
 *
 * @param {CircleProps} props - Circle 속성
 * @returns {JSX.Element} 애니메이션이 적용된 원형 요소
 *
 * @example
 * <Circle size="small" gradient="blue" position="top-1/3 left-1/12" />
 */
const Circle = ({ size, gradient, position }: CircleProps) => {
  return (
    <div
      className={`absolute rounded-full ${position} animate-twinkle-slow`}
      style={{
        width: sizes[size],
        height: sizes[size],
        background: gradients[gradient],
      }}
    />
  );
};

export default Circle;
