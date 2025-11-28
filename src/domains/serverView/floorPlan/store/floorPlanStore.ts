/**
 * @author 최산하
 * @description 플로어 플랜 전역 상태 관리 스토어 - 2D 평면도 뷰어 및 에디터의 핵심 비즈니스 로직 담당
 * Zustand와 Zundo(temporal 미들웨어)를 활용하여 자산 상태, 그리드 설정, 실행 취소(Undo)/다시 실행(Redo) 기능 구현
 * 2D 자산(Asset)과 3D 장비(Equipment) 데이터 간의 변환 로직 및 CRUD API 연동을 통한 데이터 동기화 처리
 * 자산 배치, 다중 선택/그룹화, 줌 인/아웃, 히트맵 뷰 모드 전환 등 사용자 인터랙션 전반을 제어
 */
import { create, type StateCreator } from 'zustand';
import { temporal } from 'zundo';
import { useStore } from 'zustand';
import { CELL_SIZE, HEADER_PADDING } from '../utils/constants';
import type {
  FloorPlanState,
  Asset,
  DisplayOptionsType,
  // DisplayMode,
  DashboardMetricView,
  AssetLayer,
  AssetStatus,
} from '../types';
import { createDevice, updateEquipment, deleteEquipment } from '@/domains/serverView/view3d/api/serverRoomEquipmentApi';
import { getNextDeviceNumber, generateDeviceName } from '@/domains/serverView/view3d/utils/deviceNameGenerator';
import { transform2DToEquipment, transform3DTo2DAssets } from '../utils/dataTransformer';
// import { getDeviceTypeId } from '@/domains/serverView/view3d/constants/deviceTypes';
import type { Equipment3D } from '@/domains/serverView/types';
import toast from 'react-hot-toast';

export const initialState: FloorPlanState = {
  mode: 'view',
  // displayMode: 'status',
  dashboardMetricView: 'default',
  visibleLayers: {
    floor: true,
    wall: true,
    overhead: true,
  },
  visibleSeverities: {
    normal: true,
    warning: true,
    danger: true,
  },
  displayOptions: {
    showName: true,
    showStatusIndicator: true,
    showTemperature: true,
    showUUsage: false,
    showPowerStatus: false,
    showAisle: false,
    showPUE: false,
    showFacilities: false,
    showSensors: false,
    useLOD: true,
    showGridLine: true,
  },
  gridCols: 15,
  gridRows: 8,
  stage: { scale: 1, x: 0, y: 0 },
  assets: [],
  isLoading: true,
  error: null,
  selectedAssetIds: [],
  isMagnifierEnabled: false,
};

const storeCreator: StateCreator<FloorPlanState> = () => initialState;

export const useFloorPlanStore = create<FloorPlanState>()(
  temporal(storeCreator, {
    partialize: (state: FloorPlanState) => ({
      assets: state.assets,
      selectedAssetIds: state.selectedAssetIds,
      gridCols: state.gridCols,
      gridRows: state.gridRows,
      mode: state.mode,
      // displayMode: state.displayMode,
      dashboardMetricView: state.dashboardMetricView,
      visibleLayers: state.visibleLayers,
      visibleSeverities: state.visibleSeverities,
    }),
  }),
);


export const addAsset = async (newAsset: Omit<Asset, 'id'>, serverRoomId?: string) => {
  if (!serverRoomId) {
    toast.error('서버실 ID가 없습니다.');
    return;
  }

  try {
    const { gridCols, gridRows, assets } = useFloorPlanStore.getState();
    
    // 2D Asset을 3D Equipment로 변환
    const gridConfig = {
      columns: gridCols,
      rows: gridRows,
      cellSize: 2,
    };
    
    const equipment3D = transform2DToEquipment(newAsset, gridConfig);
    
    if (!equipment3D || !equipment3D.type) {
      toast.error('지원하지 않는 자산 타입입니다.');
      return;
    }

    // 장비 이름 생성
    const nextNumber = getNextDeviceNumber(
      assets.map(a => ({
        id: a.id,
        type: equipment3D.type!,
        gridX: 0, gridY: 0, gridZ: 0, rotation: 0,
        metadata: { name: a.name }
      })),
      equipment3D.type,
      serverRoomId
    );
    const deviceName = generateDeviceName(equipment3D.type, serverRoomId, nextNumber);

    // 3D API를 통해 장비 생성
    const createdEquipment = await createDevice(
      {
        ...equipment3D,
        metadata: {
          ...equipment3D.metadata,
          name: deviceName,
          status: 'NORMAL',
        },
      } as Omit<Equipment3D, 'id' | 'equipmentId'>,
      Number(serverRoomId),
      assets.map(a => ({
        id: a.id,
        type: equipment3D.type!,
        gridX: 0, gridY: 0, gridZ: 0, rotation: 0,
        metadata: { name: a.name }
      }))
    );

    // 3D Equipment를 2D Asset으로 변환하여 스토어에 추가
    const newAssets2D = transform3DTo2DAssets([createdEquipment], gridConfig);
    
    if (newAssets2D.length > 0) {
      useFloorPlanStore.setState((state) => ({
        assets: [...state.assets, newAssets2D[0]],
      }));
      toast.success(`"${deviceName}" 자산이 추가되었습니다.`);
    }
  } catch (err) {
    console.error('Error adding asset:', err);
    toast.error('자산 추가에 실패했습니다.');
  }
};

export const updateAsset = async (
  id: string,
  newProps: Partial<Omit<Asset, 'id'>>,
) => {
  const originalAssets = useFloorPlanStore.getState().assets;
  const assetToUpdate = originalAssets.find(a => a.id === id);
  
  if (!assetToUpdate) return;

  // Optimistic Update
  const updatedAsset = { ...assetToUpdate, ...newProps, updatedAt: new Date().toISOString() };
  useFloorPlanStore.setState((state) => ({
    assets: state.assets.map((asset) =>
      asset.id === id ? updatedAsset : asset
    ),
  }));

  try {
    const { gridCols, gridRows } = useFloorPlanStore.getState();
    const gridConfig = {
      columns: gridCols,
      rows: gridRows,
      cellSize: 2,
    };

    // 2D Asset -> 3D Equipment 변환
    const equipment3D = transform2DToEquipment(updatedAsset, gridConfig);
    
    if (!equipment3D) {
      throw new Error('Failed to transform asset to equipment');
    }

    await updateEquipment(equipment3D as Equipment3D);

  } catch (err) {
    console.error('Error updating asset:', err);
    useFloorPlanStore.setState({ assets: originalAssets }); // 롤백
    toast.error('자산 업데이트에 실패했습니다.');
  }
};

export const deleteAsset = async (id: string) => {
  const { assets: originalAssets, selectedAssetIds: originalSelectedIds, gridCols, gridRows } =
    useFloorPlanStore.getState();

  const assetToDelete = originalAssets.find((asset) => asset.id === id);
  const assetName = assetToDelete?.name ?? '자산';

  if (!assetToDelete) return;

  // Optimistic Update
  useFloorPlanStore.setState((state) => ({
    assets: state.assets.filter((asset) => asset.id !== id),
    selectedAssetIds: state.selectedAssetIds.filter((sid) => sid !== id),
  }));

  toast.success(`"${assetName}"이(가) 삭제되었습니다.`);

  try {
    const gridConfig = {
      columns: gridCols,
      rows: gridRows,
      cellSize: 2,
    };

    // 2D Asset -> 3D Equipment 변환
    const equipment3D = transform2DToEquipment(assetToDelete, gridConfig);
    
    if (!equipment3D) {
      throw new Error('Failed to transform asset to equipment');
    }

    await deleteEquipment(equipment3D as Equipment3D);

  } catch (err) {
    console.error('Error deleting asset:', err);
    // 롤백
    useFloorPlanStore.setState({
      assets: originalAssets,
      selectedAssetIds: originalSelectedIds,
    });
    toast.error(`"${assetName}" 삭제에 실패했습니다.`);
  }
};

export const duplicateAsset = async (id: string) => {
  const original = useFloorPlanStore.getState().assets.find((a) => a.id === id);
  if (!original) return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, createdAt: __, updatedAt: ___, ...template } = original;
  const newAssetTemplate = {
    ...template,
    name: `${original.name} (Copy)`,
    gridX: original.gridX + 1,
    gridY: original.gridY + 1,
  };

  try {
    //  경로가 소문자 'floorplan'인지 확인
    const response = await fetch('/api/floorplan/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssetTemplate),
    });
    if (!response.ok) throw new Error('Failed to duplicate asset');
    const savedAsset = await response.json();
    useFloorPlanStore.setState((state) => ({
      assets: [...state.assets, savedAsset],
    }));
  } catch (err) {
    console.error('Error duplicating asset:', err);
    // TODO: 사용자에게 에러 알림
  }
};


export const toggleMode = () =>
  useFloorPlanStore.setState((state) => {
    const nextMode = state.mode === 'view' ? 'edit' : 'view';
    
    return {
      mode: nextMode,
      selectedAssetIds: [],
      isRackModalOpen: false,
    };
  });

export const setDashboardMetricView = (view: DashboardMetricView) =>
  useFloorPlanStore.setState({ dashboardMetricView: view });

export const toggleLayerVisibility = (layer: AssetLayer) =>
  useFloorPlanStore.setState((state) => ({
    visibleLayers: {
      ...state.visibleLayers,
      [layer]: !state.visibleLayers[layer],
    },
  }));

export const toggleSeverityVisibility = (status: AssetStatus) =>
  useFloorPlanStore.setState((state) => ({
    visibleSeverities: {
      ...state.visibleSeverities,
      [status]: !state.visibleSeverities[status],
    },
  }));

export const setDisplayOptions = (newOptions: Partial<DisplayOptionsType>) =>
  useFloorPlanStore.setState((state) => ({
    displayOptions: { ...state.displayOptions, ...newOptions },
  }));

// export const setDisplayMode = (newMode: DisplayMode) =>
//   useFloorPlanStore.setState({ displayMode: newMode });

export const setGridSize = (cols: number, rows: number) =>
  useFloorPlanStore.setState({ gridCols: cols, gridRows: rows });
export const updateServerRoomDetails = async (
 roomId: string,
 newDetails: { gridCols?: number; gridRows?: number },
) => {
 const { gridCols: oldCols, gridRows: oldRows } = useFloorPlanStore.getState();
 const oldSettings = { gridCols: oldCols, gridRows: oldRows };
 
 useFloorPlanStore.setState(newDetails);

 try {
  const response = await fetch(`/api/server-rooms/${roomId}/floorplan/details`, {
   method: 'PUT',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(newDetails),
  });
  if (!response.ok) throw new Error('Failed to update server room details');
 
  console.log('Server room details updated successfully');
  
  //성공 토스트로
  toast.success('서버실 크기가 저장되었습니다.');
 
 } catch (err) {
  console.error('Error updating server room details:', err);
  useFloorPlanStore.setState(oldSettings);
  
  toast.error('서버실 크기 저장에 실패했습니다.');
 }
};


export const setStage = (newStage: FloorPlanState['stage']) =>
  useFloorPlanStore.setState({ stage: newStage });

export const selectAsset = (id: string, isMultiSelect = false) =>
  useFloorPlanStore.setState((state) => {
    const { selectedAssetIds } = state;
    if (isMultiSelect) {
      const newSelection = selectedAssetIds.includes(id)
        ? selectedAssetIds.filter((sid) => sid !== id)
        : [...selectedAssetIds, id];
      return { selectedAssetIds: newSelection };
    }
    if (selectedAssetIds.length === 1 && selectedAssetIds[0] === id)
      return { selectedAssetIds: [] };
    return { selectedAssetIds: [id] };
  });

export const deselectAll = () =>
  useFloorPlanStore.setState({ selectedAssetIds: [] });

export const groupSelectedAssets = () => {
  const { selectedAssetIds } = useFloorPlanStore.getState();
  if (selectedAssetIds.length < 2) return;
  const groupId = `group_${crypto.randomUUID()}`;
  useFloorPlanStore.setState((state) => ({
    assets: state.assets.map((asset) =>
      selectedAssetIds.includes(asset.id) ? { ...asset, groupId } : asset,
    ),
  }));
};

export const ungroupSelectedAssets = () => {
  const { selectedAssetIds, assets } = useFloorPlanStore.getState();
  const groupIds = new Set(
    assets
      .filter((a) => selectedAssetIds.includes(a.id))
      .map((a) => a.groupId)
      .filter(Boolean),
  );
  if (groupIds.size === 0) return;
  useFloorPlanStore.setState((state) => ({
    assets: state.assets.map((asset) =>
      groupIds.has(asset.groupId) ? { ...asset, groupId: undefined } : asset,
    ),
  }));
};

export const zoom = (direction: 'in' | 'out') => {
  const { stage } = useFloorPlanStore.getState();
  const zoomFactor = 0.25;
  const newScale =
    direction === 'in'
      ? stage.scale + zoomFactor
      : Math.max(0.1, stage.scale - zoomFactor);
  useFloorPlanStore.setState({ stage: { ...stage, scale: newScale } });
};

export const useHasUnsavedChanges = () => {
  const pastStatesCount = useStore(
    useFloorPlanStore.temporal,
    (state) => state.pastStates.length,
  );
  return pastStatesCount > 0;
};

export const zoomToAsset = (assetId: string) => {
  const { assets } = useFloorPlanStore.getState();
  const stageNode = document.querySelector('.canvas-container');
  if (!stageNode) return;

  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return;

  const { width: stageWidth, height: stageHeight } =
    stageNode.getBoundingClientRect();

  const assetCenterX =
    HEADER_PADDING + (asset.gridX + asset.widthInCells / 2) * CELL_SIZE;
  const assetCenterY =
    HEADER_PADDING + (asset.gridY + asset.heightInCells / 2) * CELL_SIZE;

  const newScale = 1.0;
  const newX = stageWidth / 2 - assetCenterX * newScale;
  const newY = stageHeight / 2 - assetCenterY * newScale;

  setStage({ scale: newScale, x: newX, y: newY });
  useFloorPlanStore.setState({ selectedAssetIds: [assetId] });
};

export const toggleMagnifier = () =>
  useFloorPlanStore.setState((state) => ({
    isMagnifierEnabled: !state.isMagnifierEnabled,
  }));