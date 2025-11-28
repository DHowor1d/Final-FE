/**
 * @author 구희원
 * @description 장비 선택 드롭다운 컴포넌트
 */

import { useEffect, useRef } from "react";
import type { EquipmentCard } from "../types";

/**
 * 드롭다운 컴포넌트 props
 */
interface DropdownProps {
  open: boolean;
  position: { x: number; y: number };
  items: EquipmentCard[];
  onSelect: (item: EquipmentCard) => void;
  onClose: () => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => Promise<unknown>;
  isFetchingNextPage?: boolean;
}

/**
 * 장비 선택 드롭다운
 * @param {DropdownProps} props - 드롭다운 속성
 * @param {boolean} props.open - 드롭다운 열림 상태
 * @param {{ x: number; y: number }} props.position - 드롭다운 위치
 * @param {EquipmentCard[]} props.items - 장비 목록
 * @param {(item: EquipmentCard) => void} props.onSelect - 장비 선택 핸들러
 * @param {() => void} props.onClose - 드롭다운 닫기 핸들러
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {boolean} props.hasNextPage - 다음 페이지 존재 여부
 * @param {() => Promise<unknown>} props.fetchNextPage - 다음 페이지 조회 함수
 * @param {boolean} props.isFetchingNextPage - 다음 페이지 조회 중 상태
 * @returns 드롭다운 컴포넌트
 */
function Dropdown({
  open,
  position,
  items,
  onSelect,
  onClose,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 처리
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      if (scrollHeight - scrollTop - clientHeight < 20) {
        if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage();
        }
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 외부 클릭 및 컨텍스트 메뉴 처리
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("contextmenu", handleContextMenu);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-[9999] min-w-[200px] bg-[#2a2e3a] border border-slate-300/40 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(calc(-100% - 12px))",
      }}
    >
      <div
        ref={scrollContainerRef}
        className="py-1 max-h-[270px] overflow-y-auto [scrollbar-width:thin]"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-gray-400 text-center">
            로딩 중...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-400 text-center">
            할당 가능한 장비가 없습니다
          </div>
        ) : (
          <>
            {items.map((item) => (
              <button
                key={item.id || item.key}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600/50 transition-colors duration-150 flex items-center gap-3"
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-6 h-6 object-contain"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.size}</div>
                </div>
              </button>
            ))}

            {/* 로딩 인디케이터 */}
            {isFetchingNextPage && (
              <div className="px-4 py-2 text-center">
                <span className="text-xs text-gray-400">로딩 중...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dropdown;
