/**
 * @author 최산하
 */
import React, { useState, useEffect } from "react";
import { HiDotsVertical } from "react-icons/hi";
import type { DataCenterGroup } from "../types";

interface DataCenterTabDropdownProps {
  dataCenter: DataCenterGroup;
  onEdit: (dataCenter: DataCenterGroup) => void;
  onDelete: (dataCenter: DataCenterGroup) => void;
}

export function DataCenterTabDropdown({
  dataCenter,
  onEdit,
  onDelete,
}: DataCenterTabDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
      setIsOpen(true);
    }
  };

  const handleEdit = () => {
    onEdit(dataCenter);
    setIsOpen(false);
    setPosition(null);
  };

  const handleDelete = () => {
    onDelete(dataCenter);
    setIsOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.datacenter-tab-menu') && !target.closest('.datacenter-tab-dropdown')) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="datacenter-tab-menu">
      <button className="datacenter-tab-menu-button" onClick={toggleDropdown}>
        <HiDotsVertical size={20} />
      </button>
      {isOpen && position && (
        <div 
          className="datacenter-tab-dropdown"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          <div className="datacenter-tab-dropdown-item" onClick={handleEdit}>
            수정
          </div>
          <div 
            className="datacenter-tab-dropdown-item text-red-400 hover:text-red-300"
            onClick={handleDelete}
          >
            삭제
          </div>
        </div>
      )}
    </div>
  );
}
