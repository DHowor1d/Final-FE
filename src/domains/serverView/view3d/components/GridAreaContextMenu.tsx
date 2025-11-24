import { useEffect, useRef } from 'react';
import type { EquipmentType } from '../../types';
import { EQUIPMENT_PALETTE } from '../../constants/config';

interface GridAreaContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onSelectEquipment: (type: EquipmentType) => void;
}

/** 빈 바닥 영역 우클릭 시 나타나는 컨텍스트 메뉴 */
function GridAreaContextMenu({ x, y, onClose, onSelectEquipment }: GridAreaContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 다음 틱에 이벤트 리스너 등록
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleSelectEquipment = (type: EquipmentType) => {
    onSelectEquipment(type);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-50/30 backdrop-blur-md shadow-lg rounded-md border border-slate-300/40 z-50 min-w-[160px] max-h-[400px] overflow-y-auto"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="px-3 py-2 border-b border-slate-200">
        <span className="text-xs font-semibold text-gray-700">배치할 장비 선택</span>
      </div>
      <div className="py-1">
        {EQUIPMENT_PALETTE.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => handleSelectEquipment(item.type as EquipmentType)}
            className="w-full px-4 py-2 text-left text-sm text-gray-950 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GridAreaContextMenu;
