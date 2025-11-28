/**
 * @author 최산하
 * @description 플로팅 사이드바 패널 컴포넌트 - 화면 좌/우측에 배치되어 슬라이딩 애니메이션으로 열고 닫히는 UI 컨테이너
 * position prop('left' | 'right')에 따라 패널 위치 및 진입/이탈 방향 자동 계산
 * CSS Transform과 Transition을 활용하여 부드러운 슬라이드 효과 구현
 * 패널 측면에 부착된 토글 버튼을 통해 직관적인 개폐 제어 가능
 * Backdrop-blur(배경 흐림) 효과를 적용하여 모던한 글래스모피즘 스타일 제공
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FloatingSidebarPanelProps {
 isOpen: boolean;
 onToggle: () => void;
 position: 'left' | 'right';
 title: string;
 children: React.ReactNode;
}

const FloatingSidebarPanel: React.FC<FloatingSidebarPanelProps> = ({
 isOpen,
 onToggle,
 position,
 title,
 children,
}) => {
 const panelClasses = `
  absolute 
  top-4 
  bottom-4 
  w-[280px] 
  md:w-[320px] 
  transition-transform 
  duration-300 
  ease-in-out 
  z-10 
  ${position === 'left' ? 'left-4' : 'right-4'}
  ${
   isOpen
    ? 'translate-x-0'
    : position === 'left'
    ? '-translate-x-[calc(100%+2rem)]'
    : 'translate-x-[calc(100%+2rem)]'
  }
 `;

 const buttonClasses = `
  sidebar-toggle-button
  absolute top-1/2 -translate-y-1/2 p-2 rounded-full
  
  bg-white/90 text-gray-900 backdrop-blur-sm 
  shadow-lg 
  hover:bg-white hover:scale-105
  transition-all
  
  z-20 
  ${position === 'left' ? '-right-8' : '-left-8'}
 `;

 return (
  <div className={panelClasses}>
   {/* 사이드바 패널 내용 */}
   <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg flex flex-col h-full w-full border border-gray-700">
    <div className="p-4 border-b border-gray-600/80">
     <h2 className="text-subtitle">{title}</h2>
    </div>
    <div className="flex-grow p-4 overflow-y-auto">
     {children}
    </div>
   </div>
   
   {/* 열기/닫기 토글 버튼 */}
   <button onClick={onToggle} className={buttonClasses}>
    {position === 'left' ? (
     isOpen ? <ChevronLeft /> : <ChevronRight />
    ) : (
     isOpen ? <ChevronRight /> : <ChevronLeft />
    )}
   </button>
  </div>
 );
};

export default FloatingSidebarPanel;