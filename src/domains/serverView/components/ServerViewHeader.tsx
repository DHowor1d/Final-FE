import { useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import { useState, useRef, useEffect } from "react";
import {
  useFloorPlanStore,
  toggleMode,
  groupSelectedAssets,
  setDashboardMetricView,
  zoom,
  toggleMagnifier,
} from "../floorPlan/store/floorPlanStore";

import { useBabylonDatacenterStore } from "../view3d/stores/useBabylonDatacenterStore";
import {
  Settings,
  Eye,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Search,
} from "lucide-react";
import { useConfirmationModal } from "../floorPlan/hooks/useConfirmationModal";
import { useServerRoomEquipment } from "../view3d/hooks/useServerRoomEquipment";
import type { DashboardMetricView } from "../floorPlan/types";

interface ServerViewHeaderProps {
  serverRoomId?: string;
  viewDimension: "2D" | "3D";
  onViewDimensionChange: (dimension: "2D" | "3D") => void;
}

function ServerViewHeader({
  serverRoomId,
  viewDimension,
  onViewDimensionChange,
}: ServerViewHeaderProps) {
  const navigate = useNavigate();
  const { serverRoomName } = useServerRoomEquipment(serverRoomId ?? "");

  const { confirm } = useConfirmationModal();

  const mode = useFloorPlanStore((state) => state.mode);
  const selectedAssetIds = useFloorPlanStore((state) => state.selectedAssetIds);
  const dashboardMetricView = useFloorPlanStore((state) => state.dashboardMetricView);
  const isMagnifierEnabled = useFloorPlanStore((state) => state.isMagnifierEnabled);

  // 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBackNavigation = () => {
    navigate("/server-room-dashboard");
  };

  const undo = useStore(useFloorPlanStore.temporal, (state) => state.undo);
  const redo = useStore(useFloorPlanStore.temporal, (state) => state.redo);

  const mode3d = useBabylonDatacenterStore((state) => state.mode);
  const toggleMode3d = useBabylonDatacenterStore((state) => state.toggleMode);

  const handleToggleMode2D = () => {
    if (mode === "view") {
      // 공통으로 실행될 로직
      const switchToEditMode = (shouldGroup: boolean) => {
        if (shouldGroup) {
          groupSelectedAssets();
        }
        toggleMode(); // 2D 모드 전환 실행
      };

      if (selectedAssetIds.length > 1) {
        confirm({
          title: "자산 그룹화",
          message: (
            <p>
              여러 개의 자산(<strong>{selectedAssetIds.length}개</strong>)이
              선택되었습니다.
              <br />이 자산들을 하나의 그룹으로 묶으시겠습니까?
            </p>
          ),
          confirmText: "그룹화",
          confirmAction: () => switchToEditMode(true),
          cancelAction: () => switchToEditMode(false),
        });
      } else {
        switchToEditMode(false);
      }
    } else {
      // "편집" -> "보기" 모드로 전환 시
      toggleMode(); // 2D 모드 전환 실행
    }
  };

  //  3D 토글 핸들러(main)와 Zoom 핸들러(HEAD)를 모두 유지합니다.
  const handleToggleMode3D = () => {
    toggleMode3d();
  };

  const handleZoomIn = () => zoom("in");
  const handleZoomOut = () => zoom("out");

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (view: DashboardMetricView) => {
    setDashboardMetricView(view);
    setIsDropdownOpen(false);
  };

  // 뷰 모드 레이블 매핑
  const viewModeLabels: Record<DashboardMetricView, string> = {
    default: '📊 임계값',
    cpuDetail: '💻 CPU 상세',
    network: '⚡ 전력/네트워크',
    usage: '📦 자산 점유율',
    heatmapTemp: '🌡️ 온도 히트맵',
    heatmapPower: '⚡ 전력 히트맵',
  };

  return (
    // 헤더 태그 - z-index 추가하여 평면도 위에 표시
    <header className="bg-gray-500/30 backdrop-blur-sm border-b border-gray-700 px-6 py-2 flex items-center justify-between flex-shrink-0 relative z-50">
      <div className="flex items-center gap-4">
        {/* ... (뒤로가기 버튼 코드) ... */}
        <button
          onClick={handleBackNavigation}
          className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />{" "}
          </svg>
          <span>뒤로 가기</span>
        </button>
        <div className="h-6 w-px bg-gray-600" />
        <h1 className="text-xl font-bold text-white">
          {serverRoomName ? `서버실 ${serverRoomName}` : "N/A"}
        </h1>
      </div>

      {/* 오른쪽 컨트롤 영역 */}
      <div className="flex items-center gap-4">
        {/* 3D/2D 분기를 위해 '?' 삼항 연산자 사용  */}
        {viewDimension === "2D" ? (
          <>
            {/* 보기 모드 컨트롤 */}
            {mode === "view" && (
              
              <>
                              {/* 확대경 버튼 */}
                <button
                  onClick={toggleMagnifier}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors min-w-[110px] ${
                    isMagnifierEnabled
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700/50 border-gray-600 text-gray-100 hover:bg-gray-600'
                  }`}
                  title="확대경 모드"
                >
                  <Search className="w-5 h-5"/>
                  <span>{isMagnifierEnabled ? '확대경 끄기' : '확대경'}</span>
                </button>
                {/* 뷰 필터 드롭다운 */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-100 hover:bg-gray-600 transition-colors"
                  >
                    <span>{viewModeLabels[dashboardMetricView]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-[100] overflow-hidden">
                      <button
                        onClick={() => handleViewModeChange('default')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'default' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        📊 임계값 (기본)
                      </button>
                      <button
                        onClick={() => handleViewModeChange('cpuDetail')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'cpuDetail' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        💻 CPU 상세
                      </button>
                      <button
                        onClick={() => handleViewModeChange('network')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'network' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        ⚡ 전력/네트워크
                      </button>
                      <button
                        onClick={() => handleViewModeChange('usage')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'usage' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        📦 자산 점유율
                      </button>
                      <div className="border-t border-gray-600" />
                      <button
                        onClick={() => handleViewModeChange('heatmapTemp')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'heatmapTemp' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        🌡️ 온도 히트맵
                      </button>
                      <button
                        onClick={() => handleViewModeChange('heatmapPower')}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                          dashboardMetricView === 'heatmapPower' ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        ⚡ 전력 히트맵
                      </button>
                    </div>
                  )}
                </div>

                {/* Zoom Buttons */}
                <div className="flex items-center border border-gray-600 rounded-lg p-1 bg-gray-700/50">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded-md text-gray-100 hover:bg-gray-600 transition-colors"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="px-2 select-none text-gray-100">Zoom</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded-md text-gray-100 hover:bg-gray-600 transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>


              </>
            )}
            {/* 편집 모드 컨트롤 */}
            {mode === "edit" && (
              <div className="flex items-center gap-2 border border-gray-600 rounded-lg bg-gray-700/50">
                <button
                  onClick={() => undo()}
                  className="p-2 rounded-md flex items-center gap-1.5 text-gray-100 hover:bg-gray-600 transition-colors"
                >
                  {" "}
                  <Undo2 className="w-4 h-4" /> 되돌리기{" "}
                </button>
                <button
                  onClick={() => redo()}
                  className="p-2 rounded-md flex items-center gap-1.5 text-gray-100 hover:bg-gray-600 transition-colors"
                >
                  {" "}
                  <Redo2 className="w-4 h-4" /> 다시 실행{" "}
                </button>
              </div>
            )}
            {/*  'handleToggleMode2D'를 호출하는 버튼 사용 (main) */}
            <button
              onClick={handleToggleMode2D}
              className="py-2 px-4 rounded-lg flex items-center gap-2 transition-colors bg-gray-700/50 text-gray-100 hover:bg-gray-600 border border-gray-600"
            >
              {mode === "view" ? (
                <Settings className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              {mode === "view" ? "편집 모드" : "보기 모드"}
            </button>
          </>
        ) : (
          // 3D 뷰일 때 표시되는 컨트롤
          <button
            onClick={handleToggleMode3D}
            className="py-2 px-4 rounded-lg flex items-center gap-2 transition-colors bg-gray-700/50 text-gray-100 hover:bg-gray-600 border border-gray-600"
          >
            {mode3d === "view" ? (
              <Settings className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
            {mode3d === "view" ? "편집 모드" : "보기 모드"}
          </button>
        )}
        {/* 2D/3D 토글 버튼 */}
        <div className="flex items-center rounded-md p-1 bg-gray-700/50 border border-gray-600">
          <button
            onClick={() => onViewDimensionChange("2D")}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewDimension === "2D"
                ? "bg-gray-400 text-white shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {" "}
            2D{" "}
          </button>
          <button
            onClick={() => onViewDimensionChange("3D")}
            className={`px-3 py-1 rounded-md transition-colors ${
              viewDimension === "3D"
                ? "bg-gray-400 text-white shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {" "}
            3D{" "}
          </button>
        </div>
      </div>
    </header>
  );
}

export default ServerViewHeader;
