/**
 * @author 최산하
 * @description 캔버스 그리드 컴포넌트 - 서버실의 바닥면과 좌표계를 시각화
 * 격자(Grid) 라인과 행(숫자)/열(알파벳) 헤더를 렌더링하여 자산의 위치 식별을 도움
 * 대시보드 모드('status') 여부에 따라 배경색을 동적으로 변경하여 시각적 모드 구분 (어두운 테마/일반 테마)
 * React-Konva의 Group, Rect, Line, Text를 사용하여 고성능 벡터 그래픽으로 구현
 */
import React from 'react';
import { Group, Line, Text, Rect } from 'react-konva';

interface CanvasGridProps {
  gridSize: number;
  cols: number;
  rows: number;
  displayMode: 'status' | 'customColor'; 
}

const CanvasGrid: React.FC<CanvasGridProps> = ({ gridSize, cols, rows, displayMode }) => { 
  const lines = [];
  const headerPadding = 80;
  const isDashboardView = displayMode === 'status';

  // --- 배경 ---
  // 그리드 영역 배경
const gridBgFill = isDashboardView ? '#0a0a0a' : '#1f2937'; 
  lines.push( <Rect key="grid-bg" x={headerPadding} y={headerPadding} width={cols * gridSize} height={rows * gridSize} fill={gridBgFill} /> );  // 헤더 배경
  const headerFill = "#111827";
  lines.push( <Rect key="top-header-bg" x={headerPadding} y={0} width={cols * gridSize} height={headerPadding} fill={headerFill} /> );
  lines.push( <Rect key="left-header-bg" x={0} y={headerPadding} width={headerPadding} height={rows * gridSize} fill={headerFill} /> );
  lines.push( <Rect key="bottom-header-bg" x={headerPadding} y={headerPadding + rows * gridSize} width={cols * gridSize} height={headerPadding} fill={headerFill} /> );
  lines.push( <Rect key="right-header-bg" x={headerPadding + cols * gridSize} y={headerPadding} width={headerPadding} height={rows * gridSize} fill={headerFill} /> );
  // 코너 배경
  const cornerFill = "#030712";
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const cornerPositions = [ { x: 0, y: 0 }, { x: headerPadding + cols * gridSize, y: 0 }, { x: 0, y: headerPadding + rows * gridSize }, { x: headerPadding + cols * gridSize, y: headerPadding + rows * gridSize }, ];
  corners.forEach((key, i) => { lines.push( <Rect key={key} x={cornerPositions[i].x} y={cornerPositions[i].y} width={headerPadding} height={headerPadding} fill={cornerFill} /> ); });

  // --- 그리드 선 ---
  const gridLineStroke = "#374151";
  const gridWidth = cols * gridSize;
  const gridHeight = rows * gridSize;
  // 세로선 (선 길이 조정)
  for (let i = 0; i <= cols; i++) {
    const x = headerPadding + i * gridSize;
    lines.push( <Line key={`v-${i}`} points={[x, 0, x, gridHeight + headerPadding * 2]} stroke={gridLineStroke} strokeWidth={1} /> );
  }
  // 가로선 (선 길이 조정)
  for (let j = 0; j <= rows; j++) {
    const y = headerPadding + j * gridSize;
    lines.push( <Line key={`h-${j}`} points={[0, y, gridWidth + headerPadding * 2, y]} stroke={gridLineStroke} strokeWidth={1} /> );
  }

  // --- 헤더 텍스트 ---
  const textFill = "#9ca3af";
  const headerFontSize = 30;
  // 위쪽 & 아래쪽 열 헤더
  // if (!isDashboardView) {
    // 위쪽 & 아래쪽 열 헤더
    for (let i = 0; i < cols; i++) {
      const textProps = {
      x: headerPadding + i * gridSize,
      width: gridSize,
      text: `${String.fromCharCode(65 + i)} (${i + 1})`,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
      fontSize: headerFontSize,
      fontStyle: 'bold',
      fill: textFill,
      height: headerPadding,
     };
      lines.push(<Text key={`top-col-header-${i}`} {...textProps} y={0} />);
      lines.push(<Text key={`bottom-col-header-${i}`} {...textProps} y={headerPadding + rows * gridSize} />);
    }
    // 왼쪽 & 오른쪽 행 헤더
    for (let j = 0; j < rows; j++) {
     const textProps = {
      y: headerPadding + j * gridSize,
      height: gridSize,
      text: `${j + 1}`,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
      fontSize: headerFontSize,
      fontStyle: 'bold',
      fill: textFill,
      width: headerPadding,
     };
      lines.push(<Text key={`left-row-header-${j}`} {...textProps} x={0} />);
      lines.push(<Text key={`right-row-header-${j}`} {...textProps} x={headerPadding + gridWidth} />);
    }


  return <Group>{lines}</Group>;
};

export default CanvasGrid;
