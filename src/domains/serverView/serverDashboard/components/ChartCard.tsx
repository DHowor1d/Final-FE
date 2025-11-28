/**
 * @author 구희원
 * @description 차트 카드 컨테이너 컴포넌트
 */

import "../css/chartCard.css";
import type { ReactNode } from "react";

/**
 * 차트 카드 props
 */
interface ChartCardProps {
  title: string;
  icon?: string;
  size?: "small" | "medium" | "large";
  children: ReactNode;
}

/**
 * 차트 카드
 * @param {ChartCardProps} props - 차트 카드 속성
 * @param {string} props.title - 카드 제목
 * @param {string} props.icon - 아이콘 이미지 경로
 * @param {"small" | "medium" | "large"} props.size - 카드 크기 (기본값: "medium")
 * @param {ReactNode} props.children - 차트 내용
 * @returns 차트 카드 컴포넌트
 */
function ChartCard({ title, icon, size = "medium", children }: ChartCardProps) {
  return (
    <div className={`chart-card chart-card-${size}`}>
      <div className={icon ? "chart-header-with-icon" : "chart-header"}>
        {icon && <img src={icon} alt={title} className="chart-icon" />}
        <span className="chart-title">{title}</span>
      </div>
      <div className="chart-content">{children}</div>
    </div>
  );
}

export default ChartCard;
