import { useRef, useEffect, useState, useCallback } from 'react';
import type { Scene } from '@babylonjs/core';
import { Snackbar, Alert } from '@mui/material';
import GridFloor from './GridFloor';
import Equipment3DModel from './Equipment3DModel';
import EquipmentPalette3D from '../../components/EquipmentPalette3D';
import ContextMenu from './ContextMenu';
import GridAreaContextMenu from './GridAreaContextMenu';
import SelectionBox from './SelectionBox';
import { useBabylonDatacenterStore } from '../stores/useBabylonDatacenterStore';
import { EQUIPMENT_PALETTE } from '../../constants/config';
import { useServerRoomEquipment } from '../hooks/useServerRoomEquipment';
import { useToast } from '../hooks/useToast';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { useEquipmentActions } from '../hooks/useEquipmentActions';
import { useEquipmentDragAndDrop } from '../hooks/useEquipmentDragAndDrop';
import { useEquipmentSelection } from '../hooks/useEquipmentSelection';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { LoadingSpinner } from '@/shared/loading';
import { createDevice } from '../api/serverRoomEquipmentApi';
import { getNextDeviceNumber, generateDeviceName } from '../utils/deviceNameGenerator';
import type { EquipmentType, Equipment3D } from '../../types';

interface BabylonDatacenterViewProps {
  mode?: 'edit' | 'view'; // 초기 모드 (기본값: view)
  serverRoomId?: string; // 서버실 ID
}

function BabylonDatacenterView({ mode: initialMode = 'view', serverRoomId }: BabylonDatacenterViewProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const hasAppliedInitialModeRef = useRef(false);

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    equipmentId: string;
  } | null>(null);

  // 빈 영역 컨텍스트 메뉴 상태
  const [gridAreaContextMenu, setGridAreaContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Zustand 스토어
  const {
    gridConfig,
    equipment,
    selectedEquipmentIds,
    setSelectedEquipment,
    openRackModal,
    mode,
    setMode,
    currentServerRoomId,
    initializeServerRoom,
    clearSelection,
    setGridConfig,
    selectedEmptyArea,
    getEmptyGridsInArea,
  } = useBabylonDatacenterStore();

  // 서버실 데이터 로드
  const {
    equipment: fetchedEquipment,
    gridConfig: fetchedGridConfig,
    loading: equipmentLoading,
    isFetching: equipmentFetching,
  } = useServerRoomEquipment(serverRoomId);

  const isEquipmentReady = !equipmentLoading && !equipmentFetching;

  // 커스텀 훅들
  const { toast, showToast, hideToast } = useToast();
  
  const { scene, isSceneReady } = useBabylonScene({
    canvasRef,
    gridConfig,
    isLoading: equipmentLoading || equipmentFetching,
  });
  
  const {
    handleAddEquipment,
    handleRotateEquipment,
    handleDeleteEquipment,
    handleEquipmentPositionChange,
    handleMultipleEquipmentPositionsChange,
  } = useEquipmentActions({ 
    serverRoomId, 
    showToast 
  });

  const { handleDrop, handleDragOver } = useEquipmentDragAndDrop({
    serverRoomId,
    gridConfig,
    canvasRef,
    sceneRef,
    showToast,
  });

  const { selectionArea } = useEquipmentSelection({
    mode,
    sceneRef,
    canvasRef,
    gridConfig,
  });

  // 키보드 단축키
  useKeyboardShortcuts({
    mode,
    selectedEquipmentIds,
    onDelete: () => handleDeleteEquipment(selectedEquipmentIds),
    onClearSelection: clearSelection,
  });

  // sceneRef 설정
  useEffect(() => {
    if (isSceneReady && scene) {
      sceneRef.current = scene;
    }
  }, [isSceneReady, scene]);

  // 초기 모드 적용 (최초 한 번)
  useEffect(() => {
    if (hasAppliedInitialModeRef.current) return;
    setMode(initialMode);
    hasAppliedInitialModeRef.current = true;
  }, [initialMode, setMode]);

  // 서버실 데이터 로드 및 그리드 설정
  useEffect(() => {
    if (!serverRoomId || !isEquipmentReady) return;
    if (!fetchedEquipment || !fetchedGridConfig) return;

    // 그리드 설정 업데이트
    setGridConfig({
      rows: fetchedGridConfig.rows,
      columns: fetchedGridConfig.columns,
    });

    // 서버실 초기화 (변경 감지 로직은 initializeServerRoom 내부에서 처리)
    initializeServerRoom(serverRoomId, fetchedEquipment);
  }, [
    serverRoomId, 
    currentServerRoomId, 
    initializeServerRoom, 
    fetchedEquipment, 
    fetchedGridConfig,
    isEquipmentReady,
    setGridConfig
  ]);

  // Server 클릭 핸들러 (view 모드에서만)
  const serverClickHandler = useCallback((serverId: string) => {
    openRackModal(serverId);
  }, [openRackModal]);

  // 장비 우클릭 핸들러 (edit 모드에서만)
  const rightClickHandler = useCallback((equipmentId: string, x: number, y: number) => {
    // 우클릭한 장비가 선택되지 않았다면 선택
    if (!selectedEquipmentIds.includes(equipmentId)) {
      setSelectedEquipment(equipmentId);
    }
    setContextMenu({ x, y, equipmentId });
  }, [selectedEquipmentIds, setSelectedEquipment]);

  // 컨텍스트 메뉴 닫기
  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 컨텍스트 메뉴에서 삭제
  const handleContextMenuDelete = useCallback(async () => {
    if (!contextMenu) return;
    
    const idsToDelete = selectedEquipmentIds.length > 1 
      ? selectedEquipmentIds 
      : [contextMenu.equipmentId];
    
    await handleDeleteEquipment(idsToDelete);
    setContextMenu(null);
  }, [contextMenu, selectedEquipmentIds, handleDeleteEquipment]);

  // 빈 영역 우클릭 핸들러
  const handleGridAreaRightClick = useCallback((x: number, y: number) => {
    // 선택된 영역이 있고, 빈 격자가 있는 경우에만 메뉴 표시
    if (selectedEmptyArea) {
      const emptyGrids = getEmptyGridsInArea(
        selectedEmptyArea.startX,
        selectedEmptyArea.startY,
        selectedEmptyArea.endX,
        selectedEmptyArea.endY
      );
      
      if (emptyGrids.length > 0) {
        setGridAreaContextMenu({ x, y });
      }
    }
  }, [selectedEmptyArea, getEmptyGridsInArea]);

  // 빈 영역 컨텍스트 메뉴 닫기
  const handleGridAreaContextMenuClose = useCallback(() => {
    setGridAreaContextMenu(null);
  }, []);

  // 빈 영역에 장비 일괄 배치
  const handleBulkPlaceEquipment = useCallback(async (type: EquipmentType) => {
    if (!selectedEmptyArea || !serverRoomId) return;

    const emptyGrids = getEmptyGridsInArea(
      selectedEmptyArea.startX,
      selectedEmptyArea.startY,
      selectedEmptyArea.endX,
      selectedEmptyArea.endY
    );

    if (emptyGrids.length === 0) {
      showToast('배치할 수 있는 빈 공간이 없습니다', 'error');
      return;
    }

    try {
      const createdEquipments: Equipment3D[] = [];
      
      // 각 빈 격자에 순차적으로 장비 생성 (병렬 처리 시 deviceCode 중복 방지)
      for (let i = 0; i < emptyGrids.length; i++) {
        const grid = emptyGrids[i];
        
        // 현재까지 생성된 장비 목록 (equipment + 이미 생성된 장비들)
        const currentEquipment = [...equipment, ...createdEquipments];
        
        const nextNumber = getNextDeviceNumber(currentEquipment, type, serverRoomId);
        const deviceName = generateDeviceName(type, serverRoomId, nextNumber);

        const created = await createDevice(
          {
            type,
            gridX: grid.gridX,
            gridY: grid.gridY,
            gridZ: 0,
            rotation: 0,
            metadata: {
              name: deviceName,
              status: 'NORMAL',
            },
          },
          Number(serverRoomId),
          currentEquipment // 업데이트된 목록 전달
        );
        
        createdEquipments.push(created);
      }

      // Store에 한 번에 추가
      useBabylonDatacenterStore.setState((state) => ({
        equipment: [...state.equipment, ...createdEquipments],
        selectedEmptyArea: null, // 배치 완료 후 선택 영역 제거
      }));

      showToast(`${createdEquipments.length}개 장치가 배치되었습니다`, 'success');
    } catch (error) {
      console.error('Failed to bulk place equipment:', error);
      showToast('장치 배치에 실패했습니다', 'error');
    }
  }, [selectedEmptyArea, serverRoomId, getEmptyGridsInArea, equipment, showToast, clearSelection]);

  return (
    <div className="h-full w-full overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none"
        style={{ touchAction: 'none' }}
        onContextMenu={(e) => {
          e.preventDefault();
          // 선택된 빈 영역이 있으면 컨텍스트 메뉴 표시
          if (mode === 'edit' && selectedEmptyArea && selectedEquipmentIds.length === 0) {
            handleGridAreaRightClick(e.clientX, e.clientY);
          }
        }}
        onDrop={mode === 'edit' ? handleDrop : undefined}
        onDragOver={mode === 'edit' ? handleDragOver : undefined}
      />

      {/* 로딩 표시  */}
      {(equipmentLoading || equipmentFetching) && (
        <LoadingSpinner message="서버실 데이터를 불러오는 중..." />
      )}

      {/* 컨트롤 가이드 */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-3 text-white text-xs max-w-xs z-10">
        <div className="font-semibold mb-2">⌨️ 컨트롤</div>
        <ul className="space-y-1">
          <li>• 좌클릭 드래그 (배경): 카메라 회전</li>
          {mode === 'edit' && <li>• 좌클릭 드래그 (장비): 장비 이동</li>}
          {mode === 'edit' && <li>• Ctrl+드래그 (배경): 영역 선택</li>}
          {mode === 'edit' && selectedEmptyArea && <li>• 우클릭 (선택된 영역): 다중 배치</li>}
          <li>• 우클릭 드래그: 카메라 이동</li>
          <li>• 마우스 휠: 줌 인/아웃</li>
          {mode === 'edit' && selectedEquipmentIds.length > 0 && (
            <>
              <li>• Delete: 선택된 장비 삭제</li>
              <li>• Esc: 선택 해제</li>
            </>
          )}
        </ul>
      </div>

      {/* 회전 버튼 - 단일 또는 다중 선택 시 모두 표시 */}
      {mode === 'edit' && selectedEquipmentIds.length >= 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 border border-slate-300/40 backdrop-blur-sm rounded-lg p-3 text-white text-xs flex items-center gap-2">
          {selectedEquipmentIds.length > 1 && (
            <span className="font-semibold">{selectedEquipmentIds.length}개 선택됨</span>
          )}
          <span className="font-semibold">회전</span>
          <button
            type="button"
            onClick={() => handleRotateEquipment(false, selectedEquipmentIds)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-md px-3 py-1 text-sm"
          >
            ⟲ 90°
          </button>
          <button
            type="button"
            onClick={() => handleRotateEquipment(true, selectedEquipmentIds)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-md px-3 py-1 text-sm"
          >
            ⟳ 90°
          </button>
          {selectedEquipmentIds.length > 1 && (
            <button
              type="button"
              onClick={() => handleDeleteEquipment(selectedEquipmentIds)}
              className="bg-red-700 hover:bg-red-600 text-white rounded-md px-3 py-1 text-sm ml-2"
            >
              🗑️ 삭제
            </button>
          )}
        </div>
      )}

      {/* 장비 목록 패널 - 편집 모드에서만 표시 (오른쪽 상단에 플로팅) */}
      {mode === 'edit' && (
        <div className="absolute top-4 right-4 w-60 max-h-[calc(100vh-10rem)] z-20">
          <EquipmentPalette3D onAddEquipment={handleAddEquipment} />
        </div>
      )}

      {/* 3D 객체들 렌더링 */}
      {isSceneReady && scene && (
        <>
          {/* 격자 바닥 */}
          <GridFloor scene={scene} gridConfig={gridConfig} />

          {/* 장비들 */}
          {equipment.map((eq) => {
            const paletteItem = EQUIPMENT_PALETTE.find((p) => p.type === eq.type);
            if (!paletteItem) return null;

            return (
              <Equipment3DModel
                key={eq.id}
                scene={scene}
                equipment={eq}
                cellSize={gridConfig.cellSize}
                modelPath={paletteItem.modelPath}
                isSelected={selectedEquipmentIds.includes(eq.id)}
                  onSelect={setSelectedEquipment}
                  onPositionChange={handleEquipmentPositionChange}
                  isDraggable={mode === 'edit'} // 편집 모드에서만 드래그 가능
                  onServerClick={mode === 'view' ? serverClickHandler : undefined} // view 모드에서만 클릭 핸들러 전달
                  onRightClick={mode === 'edit' ? rightClickHandler : undefined} // edit 모드에서만 우클릭 핸들러 전달
                  selectedEquipmentIds={selectedEquipmentIds}
                  onMultiDragEnd={handleMultipleEquipmentPositionsChange}
                />
              );
            })}
          
          {/* 선택 영역 박스 */}
          {mode === 'edit' && selectionArea && (
            <SelectionBox
              scene={scene}
              startGridX={selectionArea.startX}
              startGridY={selectionArea.startY}
              endGridX={selectionArea.endX}
              endGridY={selectionArea.endY}
              cellSize={gridConfig.cellSize}
            />
          )}
          
          {/* 선택된 빈 영역 표시 */}
          {mode === 'edit' && selectedEmptyArea && !selectionArea && (
            <SelectionBox
              scene={scene}
              startGridX={selectedEmptyArea.startX}
              startGridY={selectedEmptyArea.startY}
              endGridX={selectedEmptyArea.endX}
              endGridY={selectedEmptyArea.endY}
              cellSize={gridConfig.cellSize}
            />
          )}
        </>
      )}

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
          onDelete={handleContextMenuDelete}
        />
      )}

      {/* 빈 영역 컨텍스트 메뉴 */}
      {gridAreaContextMenu && (
        <GridAreaContextMenu
          x={gridAreaContextMenu.x}
          y={gridAreaContextMenu.y}
          onClose={handleGridAreaContextMenuClose}
          onSelectEquipment={handleBulkPlaceEquipment}
        />
      )}

      {/* 토스트 메시지 */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={hideToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default BabylonDatacenterView
