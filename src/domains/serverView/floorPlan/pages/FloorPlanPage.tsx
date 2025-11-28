/**
 * @author 최산하
 * @description 2D 평면도 페이지 - 서버실의 2D 평면도를 표시하고 편집하는 페이지
 * 3D 데이터를 2D 그리드 레이아웃으로 변환하여 표시하며, 드래그&드롭으로 장비 배치 가능
 * 편집 모드에서는 장비 팔레트로 새 장비를 추가하고, 보기 모드에서는 메트릭 정보와 TopN 위젯을 표시
 * 확대경 기능으로 상세 보기 가능, 저장하지 않고 페이지 이탈 시 경고 표시
 */

import React, { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import Canvas from '../components/Canvas'; 
import { useFloorPlanDragDrop } from '../hooks/useFloorPlanDragDrop';
import { useFloorPlanNavigationGuard } from '../hooks/useFloorPlanNavigationGuard';
import { useFloorPlanStore, initialState, addAsset } from '../store/floorPlanStore';
import RackModal from '@/domains/serverView/components/RackModal';
import { useServerRoomEquipment } from '@/domains/serverView/view3d/hooks/useServerRoomEquipment';
import { transform3DTo2DAssets } from '../utils/dataTransformer';
import EquipmentPalette3D from '@/domains/serverView/components/EquipmentPalette3D';
import type { EquipmentType } from '../../types';
import type { AssetType, AssetLayer } from '../types';
import toast from 'react-hot-toast';
import { checkCollision } from '../utils/collision';
import MagnifierWidget from '../components/MagnifierWidget';

import TopNWidget from '../components/TopNWidget'; 
import { FloorPlanConfirmationModal } from '../components/FloorPlanConfirmationModal';

interface FloorPlanPageProps {
  containerRef: React.RefObject<HTMLDivElement>;
  serverRoomId: string | undefined;
}

/**
 * @function FloorPlanPage
 * @description 2D 평면도 페이지 컴포넌트 - 서버실의 장비 배치를 2D로 시각화하고 편집
 * @param {FloorPlanPageProps} props - 컨테이너 ref와 서버실 ID
 * @returns {JSX.Element} 2D 평면도 UI
 */
const FloorPlanPage: React.FC<FloorPlanPageProps> = ({ containerRef, serverRoomId }) => {
  // 훅의 반환 값에 맞게 구조분해 할당을 수정합니다.
  // 'data: apiData'가 아니라 'equipment: equipment3D'와 'gridConfig'를 직접 받습니다.
  const { equipment: equipment3D, gridConfig, loading, error } = useServerRoomEquipment(serverRoomId);

  // 확대경 관련 상태
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const isMagnifierEnabled = useFloorPlanStore((state) => state.isMagnifierEnabled);

  // 스토어 상태 초기화 (최초 마운트 시 1회)
  useEffect(() => {
    console.log('Initializing 2D FloorPlan Store...');
    // A. 2D 스토어 상태를 초기값으로 리셋
    useFloorPlanStore.setState(initialState, true);
    useFloorPlanStore.temporal.getState().clear();
  }, []); // 최초 1회 실행

  // API 데이터가 로드되면 2D 스토어에 반영
  useEffect(() => {
    if (loading) {
      console.log('2D API Hook: Loading...');
      useFloorPlanStore.setState({ isLoading: true, error: null });
      return;
    }
    if (error) {
      console.error('2D API Hook: Error', error);
      useFloorPlanStore.setState({ isLoading: false, error: error.message });
      return;
    }
    
  
  if (!loading && !error) {
    
    const sourceGridConfig = gridConfig ?? { columns: 15, rows: 8, cellSize: 2 };

    try {
      const assets2D = transform3DTo2DAssets(
        equipment3D,
        sourceGridConfig,
      );
      console.log('Transformed 2D Assets:', assets2D);

      useFloorPlanStore.setState({
        assets: assets2D,
        gridCols: sourceGridConfig.columns, 
        gridRows: sourceGridConfig.rows,    
        isLoading: false, 
        error: null,
      });
      } catch (transformError) {
        //  transform3DTo2DAssets에서 에러가 나도 로딩이 멈추지 않도록 처리
        console.error('Failed to transform 3D data to 2D:', transformError);
        useFloorPlanStore.setState({ 
          isLoading: false, 
          error: '데이터 변환 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [equipment3D, gridConfig, loading, error]);


  // 페이지 이탈 방지
  useFloorPlanNavigationGuard();
  
  const { handleDragEnd } = useFloorPlanDragDrop(containerRef, serverRoomId);
  const mode = useFloorPlanStore((state) => state.mode);
  const dashboardMetricView = useFloorPlanStore((state) => state.dashboardMetricView);

  // 3D -> 2D 타입 매핑 함수
  const map3DTypeTo2DType = (type3D: EquipmentType): AssetType | null => {
    const typeMap: Record<EquipmentType, AssetType | null> = {
      server: 'rack',
      door: 'door_single',
      climatic_chamber: 'crac',
      fire_extinguisher: 'fire_suppression',
      aircon: 'in_row_cooling',
      thermometer: 'leak_sensor',
    };
    return typeMap[type3D] || null;
  };

  // 3D 장비 팔레트에서 자산 추가
  const handleAddEquipment = (type3D: EquipmentType) => {
    const assetType2D = map3DTypeTo2DType(type3D);
    if (!assetType2D) {
      console.warn(`Cannot map 3D type ${type3D} to 2D asset type`);
      return;
    }

    // 자산 추가 로직 (중앙에 배치)
    const centerX = Math.floor(gridCols / 2);
    const centerY = Math.floor(gridRows / 2);
    
    const newAsset = {
      name: type3D,
      gridX: centerX,
      gridY: centerY,
      widthInCells: 1,
      heightInCells: 1,
      assetType: assetType2D,
      layer: 'floor' as AssetLayer,
      rotation: 0,
    };

    // 경계 검사 (중앙이라도 그리드가 너무 작을 경우를 대비)
    if (
      centerX < 0 ||
      centerY < 0 ||
      centerX + newAsset.widthInCells > gridCols ||
      centerY + newAsset.heightInCells > gridRows
    ) {
      toast.error(
        `"${newAsset.name}"을(를) 배치할 수 없습니다. 평면도 공간이 부족합니다.`,
        { id: 'asset-space-error' },
      );
      return;
    }

    // 충돌 검사
    if (checkCollision(newAsset, assets)) {
      toast.error(
        `"${newAsset.name}"을(를) 배치할 수 없습니다. 다른 자산과 겹칩니다.`,
        { id: 'asset-collision-error' },
      );
      return;
    }

    addAsset(newAsset, serverRoomId);
  };

  const gridCols = useFloorPlanStore((state) => state.gridCols);
  const gridRows = useFloorPlanStore((state) => state.gridRows);
  const assets = useFloorPlanStore((state) => state.assets);

  // 훅에서 가져온 로딩/에러 상태를 렌더링에 반영
  const isLoadingFromStore = useFloorPlanStore((state) => state.isLoading);
  const errorFromStore = useFloorPlanStore((state) => state.error);

  // 확대경 활성화 시 마우스 위치 추적
  useEffect(() => {
    if (!isMagnifierEnabled || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseLeave = () => {
      setMousePosition(null);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMagnifierEnabled, containerRef]);

  //  로딩 및 에러 UI 반환
  if (isLoadingFromStore) {
    return (
     <div className="flex-1 relative overflow-hidden flex items-center justify-center text-white bg-gray-900">
       2D 평면도 로딩 중...
     </div>
    );
  }

  if (errorFromStore) {
    return (
     <div className="flex-1 relative overflow-hidden flex items-center justify-center text-red-400 bg-gray-900">
       오류가 발생했습니다: {errorFromStore}
     </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Canvas containerRef={containerRef} serverRoomId={serverRoomId} />
      {/* TopNWidget: 보기 모드에서만 표시 */}
      {mode === 'view' && dashboardMetricView !== 'default' && <TopNWidget />}

      {/* 편집 모드에서 3D 장비 팔레트 표시 */}
      {mode === 'edit' && <EquipmentPalette3D onAddEquipment={handleAddEquipment} />}
      
      {/* 확대경 위젯: 보기 모드에서 활성화 시 표시 */}
      {mode === 'view' && isMagnifierEnabled && containerRef.current && (
        <MagnifierWidget
          mousePosition={mousePosition}
          containerWidth={containerRef.current.clientWidth}
          containerHeight={containerRef.current.clientHeight}
        />
      )}
      
      <RackModal />
      <FloorPlanConfirmationModal />
    </DndContext>
  );
};

export default FloorPlanPage;