import { useState, useEffect, useCallback } from 'react';
import type { Scene, IPointerEvent, PickingInfo } from '@babylonjs/core';
import { useBabylonDatacenterStore } from '../stores/useBabylonDatacenterStore';
import type { GridConfig } from '../../types';

interface UseEquipmentSelectionParams {
  mode: 'edit' | 'view';
  sceneRef: React.RefObject<Scene | null>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gridConfig: GridConfig;
}

/** 영역 선택 (다중 선택) 로직 */
export function useEquipmentSelection({
  mode,
  sceneRef,
  canvasRef,
  gridConfig,
}: UseEquipmentSelectionParams) {
  const {
    selectionArea,
    setSelectionArea,
    selectEquipmentInArea,
    clearSelection,
    setSelectedEmptyArea,
  } = useBabylonDatacenterStore();

  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ gridX: number; gridY: number } | null>(null);

  // 화면 좌표 → 격자 좌표 변환
  const screenToGrid = useCallback(
    (clientX: number, clientY: number): { gridX: number; gridY: number } | null => {
      const canvas = canvasRef.current;
      const scene = sceneRef.current;
      if (!canvas || !scene) return null;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const pickResult = scene.pick(x, y, (mesh) => mesh.name === 'ground');

      if (pickResult?.hit && pickResult.pickedPoint) {
        const worldX = pickResult.pickedPoint.x;
        const worldZ = pickResult.pickedPoint.z;

        const gridX = Math.floor(worldX / gridConfig.cellSize);
        const gridY = Math.floor(worldZ / gridConfig.cellSize);

        return { gridX, gridY };
      }

      return null;
    },
    [canvasRef, sceneRef, gridConfig.cellSize]
  );

  // 포인터 이벤트 핸들러
  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas || mode !== 'edit') return;

    const pointerDownHandler = (evt: IPointerEvent, pickResult: PickingInfo) => {
      if (evt.button === 2) return; // 우클릭 무시

      // 장비 클릭 시 무시
      const clickedEquipment = pickResult.pickedMesh?.name?.startsWith('equipment-') ||
        pickResult.pickedMesh?.id?.startsWith('server-') ||
        pickResult.pickedMesh?.id?.startsWith('door-') ||
        pickResult.pickedMesh?.id?.startsWith('climatic_chamber-') ||
        pickResult.pickedMesh?.id?.startsWith('fire_extinguisher-') ||
        pickResult.pickedMesh?.id?.startsWith('thermometer-') ||
        pickResult.pickedMesh?.id?.startsWith('aircon-');

      if (clickedEquipment) return;

      // Ctrl/Cmd + 좌클릭: 영역 선택 시작
      if ((evt.ctrlKey || evt.metaKey) && evt.button === 0) {
        if (pickResult.hit && (pickResult.pickedMesh?.name === 'ground' || !pickResult.pickedMesh)) {
          const gridPos = screenToGrid(evt.clientX, evt.clientY);
          if (gridPos) {
            setIsDraggingSelection(true);
            setSelectionStart(gridPos);
            setSelectionArea({
              startX: gridPos.gridX,
              startY: gridPos.gridY,
              endX: gridPos.gridX,
              endY: gridPos.gridY,
            });
            scene.activeCamera!.detachControl();
          }
        }
        return;
      }

      // 배경 클릭: 장비 선택만 해제 (selectedEmptyArea는 유지)
      if (pickResult.hit && pickResult.pickedMesh?.name === 'ground') {
        // 장비 선택만 해제
        const { clearSelection, setSelectedEmptyArea, selectedEmptyArea } = useBabylonDatacenterStore.getState();
        // selectedEmptyArea 백업
        const currentEmptyArea = selectedEmptyArea;
        clearSelection();
        // selectedEmptyArea 복원
        if (currentEmptyArea) {
          setSelectedEmptyArea(currentEmptyArea);
        }
        setSelectionStart(null);
        setIsDraggingSelection(false);
      } else if (!pickResult.hit) {
        const { clearSelection, setSelectedEmptyArea, selectedEmptyArea } = useBabylonDatacenterStore.getState();
        const currentEmptyArea = selectedEmptyArea;
        clearSelection();
        if (currentEmptyArea) {
          setSelectedEmptyArea(currentEmptyArea);
        }
        setSelectionStart(null);
        setIsDraggingSelection(false);
      }
    };

    const pointerMoveHandler = (evt: IPointerEvent) => {
      if (isDraggingSelection && selectionStart) {
        const gridPos = screenToGrid(evt.clientX, evt.clientY);
        if (gridPos) {
          setSelectionArea({
            startX: selectionStart.gridX,
            startY: selectionStart.gridY,
            endX: gridPos.gridX,
            endY: gridPos.gridY,
          });
        }
      }
    };

    const pointerUpHandler = (evt: IPointerEvent) => {
      if (isDraggingSelection && selectionStart) {
        const gridPos = screenToGrid(evt.clientX, evt.clientY);
        if (gridPos) {
          selectEquipmentInArea(
            selectionStart.gridX,
            selectionStart.gridY,
            gridPos.gridX,
            gridPos.gridY
          );
          
          // 빈 영역 선택 정보도 저장 (우클릭 메뉴용)
          setSelectedEmptyArea({
            startX: selectionStart.gridX,
            startY: selectionStart.gridY,
            endX: gridPos.gridX,
            endY: gridPos.gridY,
          });
        }
        setIsDraggingSelection(false);
        setSelectionStart(null);
        setSelectionArea(null);
        scene.activeCamera!.attachControl(canvas, true);
      }
    };

    scene.onPointerDown = pointerDownHandler;
    scene.onPointerMove = pointerMoveHandler;
    scene.onPointerUp = pointerUpHandler;

    return () => {
      if (scene.onPointerDown === pointerDownHandler) {
        scene.onPointerDown = undefined;
      }
      if (scene.onPointerMove === pointerMoveHandler) {
        scene.onPointerMove = undefined;
      }
      if (scene.onPointerUp === pointerUpHandler) {
        scene.onPointerUp = undefined;
      }
    };
  }, [
    mode,
    sceneRef,
    canvasRef,
    isDraggingSelection,
    selectionStart,
    screenToGrid,
    setSelectionArea,
    selectEquipmentInArea,
    clearSelection,
  ]);

  // 모드 변경 시 선택 해제
  useEffect(() => {
    if (mode === 'view') {
      clearSelection();
      setSelectionArea(null);
      setIsDraggingSelection(false);
      setSelectionStart(null);
    }
  }, [mode, clearSelection, setSelectionArea]);

  return {
    selectionArea,
    isDraggingSelection,
  };
}
