/**
 * @author 최산하
 * @description 캔버스 컨텍스트 메뉴 컴포넌트 - 자산 우클릭 시 나타나는 팝업 메뉴
 * 마우스 포인터 좌표(x, y)를 기준으로 메뉴를 표시하고 자산 삭제 기능을 제공
 * useRef와 이벤트 리스너를 활용하여 메뉴 외부 영역 클릭 시 자동으로 닫히는 로직 구현
 * 배경 흐림(backdrop-blur) 및 그림자 효과를 적용하여 시각적 계층 구분
 */
import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({ x, y, onClose, onDelete }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // 이벤트 버블링 이슈 방지를 위해 setTimeout 사용
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-800/90 backdrop-blur-md shadow-2xl rounded-md border border-gray-600 z-50 min-w-[140px] overflow-hidden"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
      >
        <Trash2 size={16} />
        <span>삭제</span>
      </button>
    </div>
  );
};

export default CanvasContextMenu;