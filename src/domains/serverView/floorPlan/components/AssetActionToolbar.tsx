/**
 * @author 최산하
 * @description 자산 회전 툴바 - 편집 모드에서 단일 자산 선택 시 하단에 플로팅되는 회전 제어 패널
 * 선택된 자산을 시계(CW) 또는 반시계(CCW) 방향으로 90도씩 회전시키는 기능 제공
 * 'edit' 모드이면서 '단일 선택' 상태일 때만 조건부 렌더링되어 작업 화면의 간섭 최소화
 * Zustand 스토어의 updateAsset 액션을 호출하여 회전각(Rotation) 상태를 즉시 업데이트
 */
import React from 'react';
import { useFloorPlanStore, updateAsset } from '../store/floorPlanStore';
import { RotateCw, RotateCcw } from 'lucide-react';

const AssetActionToolbar: React.FC = () => {
  const selectedAssetIds = useFloorPlanStore((state) => state.selectedAssetIds);
  const assets = useFloorPlanStore((state) => state.assets);
  const mode = useFloorPlanStore((state) => state.mode);

  // 편집 모드이고 단일 선택일 때만 표시
  if (mode !== 'edit' || selectedAssetIds.length !== 1) return null;

  const targetAsset = assets.find((a) => a.id === selectedAssetIds[0]);
  if (!targetAsset) return null;

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const currentRotation = targetAsset.rotation || 0;
    const newRotation = direction === 'cw' 
      ? (currentRotation + 90) % 360 
      : (currentRotation - 90 + 360) % 360;
    
    updateAsset(targetAsset.id, { rotation: newRotation });
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 border border-gray-600/40 bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 shadow-xl z-50">
      <span className="text-xs text-gray-300 font-semibold px-2">회전</span>
      <button
        onClick={() => handleRotate('ccw')}
        className="p-2 hover:bg-gray-700 rounded text-white transition-colors"
        title="반시계 방향 90도"
      >
        <RotateCcw size={18} />
      </button>
      <button
        onClick={() => handleRotate('cw')}
        className="p-2 hover:bg-gray-700 rounded text-white transition-colors"
        title="시계 방향 90도"
      >
        <RotateCw size={18} />
      </button>
    </div>
  );
};

export default AssetActionToolbar;