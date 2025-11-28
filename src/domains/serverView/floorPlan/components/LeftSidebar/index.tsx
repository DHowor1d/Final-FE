/**
 * @author 최산하
 * @description 좌측 사이드바 컨테이너 - 현재 모드(View/Edit)에 따라 표시 옵션 또는 속성 편집 패널을 조건부 렌더링
 * useFloorPlanStore의 mode 상태를 구독하여 UI 모드 감지
 * 'view' 모드일 경우: DisplayOptions(시각화 설정) 컴포넌트 표시
 * 'edit' 모드일 경우: PropertiesPanel(속성 편집) 컴포넌트 표시
 * 공통된 스타일(배경, 테두리, 스크롤)을 적용하는 레이아웃 래퍼 역할 수행
 */
import React from 'react';
import { useFloorPlanStore } from '../../store/floorPlanStore'; 
import DisplayOptions from './DisplayOptions';
import PropertiesPanel from './PropertiesPanel';

const LeftSidebar: React.FC = () => {
  const mode = useFloorPlanStore((state) => state.mode);

  return (
    <aside className="rounded-lg shadow-lg flex flex-col h-full bg-gray-800/70 backdrop-blur-sm border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-subtitle">
          {mode === 'view' ? '표시 옵션' : '속성 편집'}
        </h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        {mode === 'view' ? <DisplayOptions /> : <PropertiesPanel />}
      </div>
    </aside>
  );
};

export default LeftSidebar;