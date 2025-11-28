/**
 * @author 구희원
 * @description 랙 편집 사이드바 컴포넌트
 */

import { useState } from "react";
import Tools from "./Tools";
import Dropdown from "./Dropdown";
import type { EquipmentCard, UnassignedEquipment } from "../types";
import { useUnassignedEquipments } from "../hooks/useGetUnassignedEquipments";
import { deviceImageMap } from "../utils/deviceImageMap";

/**
 * 사이드바 props
 */
interface SidebarProps {
  onCardClick: (card: EquipmentCard) => void;
  isOpen: boolean;
}

/**
 * 랙 편집 사이드바
 * @param {SidebarProps} props - 사이드바 속성
 * @param {(card: EquipmentCard) => void} props.onCardClick - 장비 카드 클릭 핸들러
 * @param {boolean} props.isOpen - 사이드바 열림 상태
 * @returns 사이드바 컴포넌트
 */
function Sidebar({ onCardClick, isOpen }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState<EquipmentCard | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useUnassignedEquipments({
      enabled: dropdownOpen,
    });

  /**
   * 컨텍스트 메뉴(우클릭) 핸들러
   */
  const handleContextMenu = (e: React.MouseEvent, card: EquipmentCard) => {
    e.preventDefault();
    e.stopPropagation();

    const iconRect = e.currentTarget.getBoundingClientRect();
    const sidebarRect = e.currentTarget
      .closest(".relative.flex-col")
      ?.getBoundingClientRect();

    if (sidebarRect) {
      setDropdownPosition({
        x: iconRect.left - sidebarRect.left,
        y: iconRect.top - sidebarRect.top,
      });
    }

    setSelectedCard(card);
    setDropdownOpen(true);
  };

  /**
   * 드롭다운 장비 선택 핸들러
   */
  const handleDropdownSelect = (item: EquipmentCard) => {
    onCardClick(item);
    setDropdownOpen(false);
  };

  /**
   * 드롭다운 닫기 핸들러
   */
  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  /**
   * 선택된 타입에 맞는 미할당 장비 필터링
   */
  const getFilteredEquipments = (): EquipmentCard[] => {
    if (!selectedCard || !data?.allEquipments) {
      return [];
    }

    return data.allEquipments
      .filter(
        (equipment: UnassignedEquipment) =>
          equipment.equipmentType?.toUpperCase() ===
          selectedCard.type?.toUpperCase()
      )
      .map((equipment: UnassignedEquipment) => ({
        key: equipment.id.toString(),
        label: equipment.equipmentName,
        size: `${equipment.unitSize}U`,
        img:
          deviceImageMap[equipment.equipmentType]?.front ||
          deviceImageMap.SERVER.front,
        height: equipment.unitSize,
        type: equipment.equipmentType,
        id: equipment.id,
      }));
  };

  return (
    <div
      className={`
        relative
        flex-col items-center justify-start flex-shrink-0
        bg-[#404452]/90 backdrop-blur-sm
        border-r border-slate-300/40
        rounded-lb-xl
        pt-10 transition-all duration-300 ease-in-out
        ${isOpen ? "w-[56px] opacity-100" : "w-0 opacity-0 pointer-events-none"}
        overflow-visible
      `}
    >
      <Tools onCardClick={onCardClick} onContextMenu={handleContextMenu} />

      <Dropdown
        open={dropdownOpen}
        position={dropdownPosition}
        items={getFilteredEquipments()}
        onSelect={handleDropdownSelect}
        onClose={handleDropdownClose}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}

export default Sidebar;
