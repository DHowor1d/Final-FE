/**
 * @author 최산하
 * @description 우측 사이드바 컨테이너 - 모드(View/Edit)에 따라 속성 조회 또는 편집 컴포넌트를 조건부 렌더링
 * useFloorPlanStore의 mode 상태를 감지하여 '속성 정보'(Viewer)와 '속성 편집'(Editor) 간 전환 처리
 * 보기 모드: PropertiesViewer를 통해 선택된 자산의 상태/메타데이터를 읽기 전용으로 표시
 * 편집 모드: PropertiesEditor를 통해 자산의 위치, 크기, 이름 등 속성 수정 인터페이스 제공
 * 사이드바의 공통 레이아웃(헤더, 배경, 스타일) 관리
 */
import React from 'react';
import { useFloorPlanStore } from '../../store/floorPlanStore'; 
import PropertiesEditor from './PropertiesEditor';
import PropertiesViewer from './PropertiesViewer';

const RightSidebar: React.FC = () => {
  const mode = useFloorPlanStore((state) => state.mode);

  return (
    <aside className="rounded-lg shadow-lg flex flex-col bg-gray-800/70 backdrop-blur-sm border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-subtitle">
          {mode === 'view' ? '속성 정보' : '속성 편집'}
        </h2>
      </div>
      <div className="flex-grow p-4">
        {mode === 'view' ? <PropertiesViewer /> : <PropertiesEditor />}
      </div>
    </aside>
  );
};

export default RightSidebar;