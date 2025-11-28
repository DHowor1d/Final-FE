/**
 * @author 최산하
 * @description 메인 2D 캔버스 컴포넌트 - 서버실 평면도 시각화 및 편집의 핵심 영역
 * Konva.js(react-konva) 기반의 Stage/Layer 구조를 통해 그리드, 자산, 히트맵을 렌더링
 * 마우스 휠 줌/팬, 외부 자산 드래그 앤 드롭 배치, 우클릭 컨텍스트 메뉴 등 주요 인터랙션 처리
 * 보기 모드(View/Edit) 및 대시보드 옵션(히트맵, 상태 필터)에 따른 동적 렌더링 지원
 */
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { useDroppable } from '@dnd-kit/core';
import type { KonvaEventObject } from 'konva/lib/Node';
import {
 useFloorPlanStore,
 setStage,
 deselectAll,
 addAsset,
} from '../store/floorPlanStore';
import AssetRenderer from './AssetRenderer';
import CanvasGrid from './CanvasGrid';
import HeatmapLayer from './HeatmapLayer';
import type { AssetLayer, DisplayMode, AssetType } from '../types';
import AssetActionToolbar from './AssetActionToolbar';
import CanvasContextMenu from './CanvasContextMenu';
import { deleteAsset } from '../store/floorPlanStore';
import { checkCollision } from '../utils/collision';
import toast from 'react-hot-toast';
import type { EquipmentType } from '../../types';

interface CanvasProps {
 containerRef: React.RefObject<HTMLDivElement>;
 serverRoomId?: string;
}
const CANVAS_VIEW_CONFIG = { CELL_SIZE: 160, HEADER_PADDING: 80 };
const layerOrder: Record<AssetLayer, number> = { floor: 1, wall: 2, overhead: 3 };


const Canvas: React.FC<CanvasProps> = ({ containerRef, serverRoomId }) => {
 const isLoading = useFloorPlanStore((state) => state.isLoading);
 const error = useFloorPlanStore((state) => state.error);
 const assets = useFloorPlanStore((state) => state.assets);
 const selectedAssetIds = useFloorPlanStore((state) => state.selectedAssetIds);
 const gridCols = useFloorPlanStore((state) => state.gridCols);
 const gridRows = useFloorPlanStore((state) => state.gridRows);
 const stage = useFloorPlanStore((state) => state.stage);
//  const displayMode = useFloorPlanStore((state) => state.displayMode);
 const displayOptions = useFloorPlanStore((state) => state.displayOptions);

 const visibleLayers = useFloorPlanStore((state) => state.visibleLayers);
 const visibleSeverities = useFloorPlanStore((state) => state.visibleSeverities);
 const dashboardMetricView = useFloorPlanStore(
  (state) => state.dashboardMetricView,
 );

 // layout 모드가 제거되었으므로 항상 'status' 모드 사용
 const synthesizedDisplayMode: DisplayMode = 'status';

 const isDashboardView = true; // 항상 대시보드 뷰
 const isHeatmapView = dashboardMetricView.startsWith('heatmap');

 const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
 const { setNodeRef } = useDroppable({ id: 'canvas-drop-area' });
 const [isInitialZoomSet, setIsInitialZoomSet] = useState(false);
const mode = useFloorPlanStore((state) => state.mode); // mode 가져오기

  // 2. 컨텍스트 메뉴 상태 추가
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; assetId: string } | null>(null);

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

  // 네이티브 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const equipmentType = e.dataTransfer.getData('equipmentType') as EquipmentType;
    if (!equipmentType) return;

    const assetType2D = map3DTypeTo2DType(equipmentType);
    if (!assetType2D) {
      console.warn(`Cannot map 3D type ${equipmentType} to 2D asset type`);
      return;
    }

    if (!containerRef.current) return;

    // 캔버스 기준 좌표 계산
    const { top: containerTop, left: containerLeft } =
      containerRef.current.getBoundingClientRect();
    
    const dropX_relative = e.clientX - containerLeft;
    const dropY_relative = e.clientY - containerTop;

    // Stage 좌표로 변환
    const stageX = (dropX_relative - stage.x) / stage.scale;
    const stageY = (dropY_relative - stage.y) / stage.scale;

    // 그리드 좌표로 변환
    const { CELL_SIZE, HEADER_PADDING } = CANVAS_VIEW_CONFIG;
    const gridX = Math.floor((stageX - HEADER_PADDING) / CELL_SIZE);
    const gridY = Math.floor((stageY - HEADER_PADDING) / CELL_SIZE);

    const newAsset = {
      name: equipmentType,
      gridX,
      gridY,
      widthInCells: 1,
      heightInCells: 1,
      assetType: assetType2D,
      layer: 'floor' as AssetLayer,
      rotation: 0,
    };

    // 경계 검사
    if (
      gridX < 0 ||
      gridY < 0 ||
      gridX + newAsset.widthInCells > gridCols ||
      gridY + newAsset.heightInCells > gridRows
    ) {
      toast.error(
        `"${newAsset.name}"을(를) 평면도 밖으로 배치할 수 없습니다.`,
        { id: 'asset-out-of-bounds-error' },
      );
      return;
    }

    // 충돌 체크
    if (checkCollision(newAsset, assets)) {
      toast.error(
        `"${newAsset.name}"을(를) 배치할 수 없습니다. 다른 자산과 겹칩니다.`,
        { id: 'asset-collision-error' },
      );
      return;
    }

    addAsset(newAsset, serverRoomId);
  };

  // 3. 우클릭 핸들러 (자산에서 호출됨)
  const handleAssetContextMenu = (e: KonvaEventObject<PointerEvent>, assetId: string) => {
    e.evt.preventDefault(); // 브라우저 메뉴 방지
    if (mode !== 'edit') return; // 편집 모드일 때만

    // 마우스의 현재 화면 좌표 (Stage 기준 아님)
    const pointer = e.evt;
    setContextMenu({
      x: pointer.clientX,
      y: pointer.clientY,
      assetId,
    });
  };

  // 4. 빈 공간 우클릭 시 메뉴 닫기
  const handleStageContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    if (e.target === e.target.getStage()) {
      setContextMenu(null);
    }
  };
 // Effect 1: Resize listener
 useEffect(() => {
  const checkSize = () => {
   if (containerRef.current) {
    console.log(
     'Canvas container size:',
     containerRef.current.clientWidth,
     containerRef.current.clientHeight,
    );
    setStageSize({
     width: containerRef.current.clientWidth,
     height: containerRef.current.clientHeight,
    });
   }
  };
  checkSize();
  window.addEventListener('resize', checkSize);
  return () => window.removeEventListener('resize', checkSize);
 }, [containerRef]); 
 // Effect 2: Initial zoom
 useLayoutEffect(() => {
  if (
   !isLoading &&
   !error &&
   gridCols > 0 &&
   stageSize.width > 0 &&
   !isInitialZoomSet
  ) {
   const { CELL_SIZE, HEADER_PADDING } = CANVAS_VIEW_CONFIG;
   const totalPlanWidth = gridCols * CELL_SIZE + HEADER_PADDING * 2;
   const totalPlanHeight = gridRows * CELL_SIZE + HEADER_PADDING * 2;
   const padding = 0.95;
   const scaleX = (stageSize.width * padding) / totalPlanWidth;
   const scaleY = (stageSize.height * padding) / totalPlanHeight;
   const newScale = Math.min(scaleX, scaleY);
   const newX = (stageSize.width - totalPlanWidth * newScale) / 2;
   const newY = (stageSize.height - totalPlanHeight * newScale) / 2;
   setStage({ scale: newScale, x: newX, y: newY });
   setIsInitialZoomSet(true);
  }
 }, [isLoading, error, gridCols, gridRows, stageSize, isInitialZoomSet]);

 // Event Handlers
 const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  const scaleBy = 1.05;
  const stageNode = e.target.getStage();
  if (!stageNode) return;
  const oldScale = stageNode.scaleX();
  const pointer = stageNode.getPointerPosition();
  if (!pointer) return;
  const mousePointTo = {
   x: (pointer.x - stageNode.x()) / oldScale,
   y: (pointer.y - stageNode.y()) / oldScale,
  };
  const newScale =
   e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
  setStage({
   scale: newScale,
   x: pointer.x - mousePointTo.x * newScale,
   y: pointer.y - mousePointTo.y * newScale,
  });
 };
 const handleStageDragEnd = (e: KonvaEventObject<DragEvent>) => {
  const stageNode = e.target.getStage();
  if (stageNode) {
   setStage({
    scale: stageNode.scaleX(),
    x: stageNode.x(),
    y: stageNode.y(),
   });
  }
 };
 const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
  if (e.target === e.target.getStage()) {
   deselectAll();
  }
 };

 const filteredAndSortedAssets =
  !isLoading && !error
   ? [...assets]
     .filter((asset) => {
      if (!visibleLayers[asset.layer]) {
       return false;
      }
      if (
       isDashboardView &&
       !isHeatmapView &&
       asset.assetType === 'rack'
      ) {
       const status = asset.status ?? 'normal';
       return visibleSeverities[status];
      }
      return true;
     })
     .sort(
      (a, b) => (layerOrder[a.layer] || 0) - (layerOrder[b.layer] || 0),
     )
   : [];

 if (isLoading) {
  return (
   <main
    className="canvas-container w-full h-full flex items-center justify-center text-gray-400"
    ref={containerRef}
   >
    <div>데이터를 불러오는 중입니다...</div>
   </main>
  );
 }

 if (error) {
  return (
   <main
    className="canvas-container w-full h-full flex items-center justify-center text-red-500"
    ref={containerRef}
   >
    <div>오류가 발생했습니다: {error}</div>
   </main>
  );
 }

 return (
  <main className="canvas-container w-full h-full" ref={containerRef}>
   <div 
     ref={setNodeRef} 
     style={{ width: '100%', height: '100%' }}
     onDragOver={handleDragOver}
     onDrop={handleDrop}
   >
    {stageSize.width > 0 && stageSize.height > 0 && (
     <Stage
      width={stageSize.width}
      height={stageSize.height}
      onWheel={handleWheel}
      draggable
      onDragEnd={handleStageDragEnd}
      onClick={handleStageClick}
      onTap={handleStageClick}
      scaleX={stage.scale}
      scaleY={stage.scale}
      x={stage.x}
      y={stage.y}
      onContextMenu={handleStageContextMenu}
     >
      <Layer>
       <CanvasGrid
        cols={gridCols}
        rows={gridRows}
        gridSize={CANVAS_VIEW_CONFIG.CELL_SIZE}
        displayMode={synthesizedDisplayMode}
       />
       {/* 2. 자산 (히트맵 뷰일 때 30% 투명도) */}
       <Group opacity={isHeatmapView ? 0.3 : 1}>
        {filteredAndSortedAssets.map((asset) => (
         <AssetRenderer
          key={asset.id}
          asset={asset}
          gridSize={CANVAS_VIEW_CONFIG.CELL_SIZE}
          headerPadding={CANVAS_VIEW_CONFIG.HEADER_PADDING}
          isSelected={selectedAssetIds.includes(asset.id)}
          displayMode={
           isHeatmapView ? 'customColor' : synthesizedDisplayMode
          }
          displayOptions={displayOptions}
          currentScale={stage.scale}
          onContextMenu={(e) => handleAssetContextMenu(e, asset.id)}
         />
        ))}
       </Group>
      </Layer>

      {/* 3. 히트맵 레이어 */}
      {isHeatmapView && (
       <Layer>
        <HeatmapLayer viewMode={dashboardMetricView} />
       </Layer>
      )}
     </Stage>
    )}
   </div>
   <AssetActionToolbar />
      
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => deleteAsset(contextMenu.assetId)}
        />
      )}
  </main>
 );
};

export default Canvas;