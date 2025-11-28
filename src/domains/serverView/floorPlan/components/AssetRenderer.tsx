/**
 * @author 최산하
 * @description 자산 렌더러 컴포넌트 - 모드와 자산 타입에 따라 적절한 시각화 컴포넌트를 분기 처리(Dispatcher)
 * 'edit' 모드: 편집이 가능한 LayoutAssetView 렌더링
 * 'view' 모드:
 * - 'status' 디스플레이 모드이면서 'Rack(랙)'인 경우: 상태 모니터링용 DashboardAssetView 렌더링
 * - 그 외(비-랙 자산 또는 일반 보기 모드): 표준 LayoutAssetView 렌더링
 * Konva Canvas 내부에서 각 자산 객체를 그리는 진입점 역할 수행
 */
import React from 'react';
import { useFloorPlanStore } from '../store/floorPlanStore';
import type { Asset, DisplayMode, DisplayOptionsType } from '../types';
import type { KonvaEventObject } from 'konva/lib/Node';
import LayoutAssetView from './LayoutAssetView';
import DashboardAssetView from './DashboardAssetView';

export interface AssetRendererProps {
  asset: Asset;
  gridSize: number;
  headerPadding: number;
  isSelected: boolean;
  displayMode: DisplayMode;
  displayOptions: DisplayOptionsType;
  currentScale: number;
  onContextMenu?: (e: KonvaEventObject<PointerEvent>) => void;
}

const AssetRenderer: React.FC<AssetRendererProps> = (props) => {
  // 1. 훅 호출을 컴포넌트 최상단으로 이동시킵니다.
  const mode = useFloorPlanStore((state) => state.mode);

  // 2. 훅 호출 이후에 조건부 반환(early return)을 수행합니다.
  if (!props.asset) {
    console.error('AssetRenderer received undefined asset prop!');
    return null;
  }
  const { displayMode, asset } = props; 

  // 1. "편집" 모드일 때는 항상 LayoutAssetView (모든 자산)
  if (mode === 'edit') {
    return <LayoutAssetView {...props} />;
  }

  // 2. "보기" 모드일 때
if (mode === 'view') {
    if (displayMode === 'status') { // '상태 임계값' 모드
      if (asset.assetType === 'rack') {
        //  2. currentScale prop 전달
        return <DashboardAssetView {...props} />;
      } else {
        //  2. currentScale prop 전달
        return <LayoutAssetView {...props} />;
      }
    } else {
      //  2. currentScale prop 전달
      return <LayoutAssetView {...props} />;
    }
  }

  return null;
};

export default AssetRenderer;