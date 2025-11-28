/**
 * @author 구희원
 * @description 배경 애니메이션용 Circle 컴포넌트 모음
 *
 * - 여러 Circle 컴포넌트를 지정된 위치, 크기, 색상으로 배치
 * - Tailwind CSS를 활용한 위치 및 z-index 관리
 * - 화면 전체를 덮는 고정 배경으로 설정
 */

import Circle from "./Circle";
import type { CircleConfig } from "../types/circle";

/**
 * 각 Circle의 설정 정보
 */
const CIRCLE_CONFIGS: CircleConfig[] = [
  { id: "1", size: "small", gradient: "blue", position: "top-1/3 left-1/12" },
  {
    id: "2",
    size: "small",
    gradient: "purple",
    position: "bottom-1/4 left-1/12",
  },
  { id: "3", size: "medium", gradient: "pink", position: "top-1/4 left-1/3" },
  { id: "4", size: "medium", gradient: "orange", position: "top-1/2 left-1/3" },
  { id: "5", size: "small", gradient: "blue", position: "top-1/2 right-1/4" },
  { id: "6", size: "small", gradient: "purple", position: "top-1/2 right-1/7" },
  { id: "7", size: "small", gradient: "pink", position: "top-1/6 right-1/12" },
];

/**
 * 배경 애니메이션 컴포넌트
 *
 * @returns {JSX.Element} 배경에 고정된 Circle 애니메이션 요소
 *
 * @example
 * <AnimationBackground />
 */
function AnimationBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {CIRCLE_CONFIGS.map((config) => (
        <Circle
          key={config.id}
          size={config.size}
          gradient={config.gradient}
          position={config.position}
        />
      ))}
    </div>
  );
}

export default AnimationBackground;
