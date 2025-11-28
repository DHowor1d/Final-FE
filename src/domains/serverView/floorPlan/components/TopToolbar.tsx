/**
 * @author 최산하
 * @description 상단 툴바 컴포넌트 - 서버실 타이틀 표시 및 모드별(보기/편집) 핵심 제어 기능 제공
 * 보기 모드: 캔버스 줌(Zoom) 레벨 조정 및 확대경 위젯 토글 기능 지원
 * 편집 모드: Zustand Temporal 미들웨어를 활용한 실행 취소(Undo) 및 다시 실행(Redo) 기능 제공
 * 모드 전환 시 다중 선택된 자산이 존재할 경우 자동으로 그룹화 여부를 확인하는 사용자 편의 로직 포함
 */
import React from 'react';
import { useStore } from 'zustand';
import { useFloorPlanStore, toggleMagnifier, toggleMode, groupSelectedAssets, zoom } from '../store/floorPlanStore';
// 아이콘 라이브러리 임포트
import { Settings, Eye, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const TopToolbar: React.FC = () => {
  // --- 상태 관리---
  const mode = useFloorPlanStore((state) => state.mode);
  const selectedAssetIds = useFloorPlanStore((state) => state.selectedAssetIds);
  const isMagnifierEnabled = useFloorPlanStore((state) => state.isMagnifierEnabled);
  
  const undo = useStore(useFloorPlanStore.temporal, (state) => state.undo);
  const redo = useStore(useFloorPlanStore.temporal, (state) => state.redo);

  // --- 이벤트 핸들러 ---
  const handleToggleMode = () => {
    if (mode === 'view' && selectedAssetIds.length > 1) {
      if (window.confirm(
        `여러 개의 자산(${selectedAssetIds.length}개)이 선택되었습니다.\n이 자산들을 하나의 그룹으로 묶으시겠습니까?`
      )) {
        groupSelectedAssets();
      }
    }
    toggleMode();
  };

  return (
    <div className="shadow-md p-3 flex justify-between items-center w-full z-10">
      {/* 왼쪽: 타이틀 */}
   <h1 className="text-title-page">제1서버실 A-Zone</h1>

   {/* 오른쪽: 컨트롤 버튼 */}
   <div className="flex items-center gap-4">

    {/* --- 보기 모드 컨트롤 --- */}
    {mode === 'view' && (
     <>
      {/* 확대경 버튼 */}
      <button
        onClick={toggleMagnifier}
        className={`p-2 rounded-lg flex items-center gap-2 transition-colors text-button ${
          isMagnifierEnabled ? 'bg-blue-600 text-white' : ''
        }`}
        title="확대경 모드"
      >
        <Maximize2 className="w-5 h-5"/>
        {isMagnifierEnabled ? '확대경 끄기' : '확대경'}
      </button>
            
      {/* 줌 컨트롤 */}
      <div className="flex items-center border rounded-lg p-1">
       <button onClick={() => zoom('out')} className="p-1 rounded-md text-button">
        <ZoomOut className="w-5 h-5"/>
       </button>
       <span className="px-2 select-none text-body-primary">Zoom</span>
       <button onClick={() => zoom('in')} className="p-1 rounded-md text-button">
        <ZoomIn className="w-5 h-5"/>
       </button>
      </div>
     </>
    )}

    {/* --- 편집 모드 컨트롤 --- */}
    {mode === 'edit' && (
     <div className="flex items-center gap-2 border rounded-lg p-1">
      <button onClick={() => undo()} className="p-2 rounded-md flex items-center gap-1.5 text-button">
       <Undo2 className="w-4 h-4"/> 되돌리기
      </button>
      <button onClick={() => redo()} className="p-2 rounded-md flex items-center gap-1.5 text-button">
       <Redo2 className="w-4 h-4"/> 다시 실행
      </button>
     </div>
    )}

        {/* --- 메인 모드 전환 버튼 --- */}
        <button
     onClick={handleToggleMode}
     className="py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-button"
    >
     {mode === 'view' ? <Settings className="w-5 h-5"/> : <Eye className="w-5 h-5" />}
     {mode === 'view' ? '편집 모드' : '보기 모드'}
    </button>
   </div>
    </div>
  );
};

export default TopToolbar;


