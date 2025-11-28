/**
 * @author 구희원
 * @description 클릭 가능한 아이콘 컴포넌트 (Konva)
 */

import { Group, Image } from "react-konva";

/**
 * 클릭 가능한 아이콘 props
 */
interface ClickableIconProps {
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}

/**
 * 클릭 가능한 아이콘
 * @param {ClickableIconProps} props - 아이콘 속성
 * @param {HTMLImageElement | null} props.image - 표시할 이미지
 * @param {number} props.x - X 좌표
 * @param {number} props.y - Y 좌표
 * @param {number} props.width - 너비
 * @param {number} props.height - 높이
 * @param {() => void} props.onClick - 클릭 이벤트 핸들러
 * @returns 클릭 가능한 아이콘 컴포넌트
 */
function ClickableIcon({
  image,
  x,
  y,
  width,
  height,
  onClick,
}: ClickableIconProps) {
  if (!image) return null;

  return (
    <Group
      x={x}
      y={y}
      onClick={(e) => {
        e.cancelBubble = true;
        onClick();
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
    >
      <Image
        image={image as CanvasImageSource}
        x={0}
        y={0}
        width={width}
        height={height}
      />
    </Group>
  );
}

export default ClickableIcon;
