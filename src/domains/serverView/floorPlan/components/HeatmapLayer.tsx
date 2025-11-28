/**
 * @author 최산하
 * @description 히트맵 시각화 레이어 컴포넌트 - 서버실 내 온도 및 전력 분포를 직관적인 열지도(Heatmap) 형태로 표현
 * 자산의 센서 데이터(온도, 전력량)를 정규화하여 시각적 가중치(반지름, 투명도)로 변환하는 로직 수행
 * React-Konva의 Circle과 RadialGradient를 활용하여 부드러운 그라데이션 효과 구현
 * globalCompositeOperation="lighter" 속성을 적용하여 데이터 중첩 구역(Hotspot)을 자연스럽게 강조
 * viewMode에 따라 온도(Red) 및 전력(Yellow) 테마를 동적으로 전환
 */
import React, { useMemo } from 'react';
import { Group, Circle } from 'react-konva';
import { useFloorPlanStore } from '../store/floorPlanStore';
import type { DashboardMetricView, Asset } from '../types';

// (이 값들은 Canvas.tsx와 일치해야 함)
const CELL_SIZE = 160;
const HEADER_PADDING = 80;

interface HeatmapLayerProps {
 viewMode: DashboardMetricView; // 'heatmapTemp' 또는 'heatmapPower'
}

// 헬퍼: 값을 0~1 사이로 정규화
const normalize = (val: number, min: number, max: number) => {
 if (val < min) return 0;
 if (val > max) return 1;
 return (val - min) / (max - min);
};

// 헬퍼: 히트맵 데이터 계산
const getHeatmapPoints = (
 assets: Asset[],
 viewMode: DashboardMetricView,
) => {
 return assets
  .filter((a) => a.assetType === 'rack' && a.data)
  .map((asset) => {
   let value = 0;
   let baseColorRGB = ''; // 예: '231, 76, 60'

   if (viewMode === 'heatmapTemp') {
    const temp = asset.data?.temperature ?? 20;
    // 25도(정상) ~ 40도(위험) 사이를 0~1로 정규화
    value = normalize(temp, 25, 40);
    baseColorRGB = '231, 76, 60'; // 빨간색
   } else if (viewMode === 'heatmapPower') {
    const power = asset.data?.powerUsage ?? 0;
    // 1kW(낮음) ~ 8kW(높음) 사이를 0~1로 정규화
    value = normalize(power, 1, 8);
    baseColorRGB = '243, 156, 18'; // 노란색
   }

   // 랙의 중심 좌표
   const x =
    HEADER_PADDING +
    (asset.gridX + asset.widthInCells / 2) * CELL_SIZE;
   const y =
    HEADER_PADDING +
    (asset.gridY + asset.heightInCells / 2) * CELL_SIZE;
   
   // 값(value)에 따라 원의 크기(반지름) 조절
   const radius = CELL_SIZE * (0.7 + value * 1); // 0.8셀 ~ 2.0셀 크기
   
   // 중심부(stop 0)와 가장자리(stop 1)의 색상을 배열로 직접 생성
   const centerAlpha = 0.2 + value * 0.9; // 10% ~ 90%
   const colorStops = [
    0, `rgba(${baseColorRGB}, ${centerAlpha})`, // Stop 0: 중심부 색상
    1, `rgba(${baseColorRGB}, 0)` // Stop 1: 완전 투명한 가장자리
   ];

   return {
    id: asset.id,
    x,
    y,
    radius,
    colorStops, // color 대신 colorStops를 반환
   };
  })
  .filter(p => p.radius > 0); // 값이 있는 것만
};


const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ viewMode }) => {
 const assets = useFloorPlanStore((state) => state.assets);

 // 1. viewMode 또는 assets가 변경될 때 히트맵 데이터 계산
 const points = useMemo(
  () => getHeatmapPoints(assets, viewMode),
  [assets, viewMode],
 );

 return (
  <Group listening={false}>
   {points.map((point) => (
    <Circle
     key={point.id}
     x={point.x}
     y={point.y}
     radius={point.radius}
     fillRadialGradientStartPoint={{ x: 0, y: 0 }}
     fillRadialGradientStartRadius={0}
     fillRadialGradientEndPoint={{ x: 0, y: 0 }}
     fillRadialGradientEndRadius={point.radius}
     
     // 미리 계산된 colorStops 배열을 그대로 전달
     fillRadialGradientColorStops={point.colorStops}
     
     globalCompositeOperation="lighter" // 여러 원이 겹칠 때 더 밝게
    />
   ))}
  </Group>
 );
};

export default HeatmapLayer;