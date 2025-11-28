/**
 * @author 최산하
 */
import { useState } from 'react'; 
import type { Table } from '@tanstack/react-table';
import type { Resource, ResourceStatus } from '../types/resource.types'; 
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from 'lucide-react';

import { RESOURCE_STATUS_OPTIONS } from '../constants/resource.constants';

interface ResourcePaginationActionsProps {
  table: Table<Resource>;
  onDeleteSelectedHandler: () => void;
  //  상태 변경 핸들러 prop 
  onStatusChangeSelectedHandler: (newStatus: ResourceStatus) => void;
  disabled?: boolean;
}

export default function ResourcePaginationActions({
  table,
  onDeleteSelectedHandler,
  onStatusChangeSelectedHandler, //  prop 받기
  disabled = false,
}: ResourcePaginationActionsProps) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  //  드롭다운의 현재 값을 제어하기 위한 state
  const [statusSelectValue, setStatusSelectValue] = useState('');

  // 드롭다운 변경 핸들러
  const handleBulkStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = event.target.value;

    // "상태 변경" (빈 값)을 선택하면 무시
    if (!newStatus) {
      return;
    }

    // 페이지(상위 컴포넌트)로 선택된 상태 값 전달
    onStatusChangeSelectedHandler(newStatus as ResourceStatus);

    // 드롭다운을 다시 "상태 변경"으로 리셋
    setStatusSelectValue('');
  };

  return (
    <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* --- Bulk Actions --- */}
      <div className="flex items-center gap-2">
        <span className="text-body-primary">
          <span className="inline-block min-w-[2ch] text-right">{selectedCount}</span> 개 항목 선택됨:
        </span>
        <button
          disabled={selectedCount === 0 || disabled}
          className="flex items-center px-3 py-1 border border-gray-700 rounded-lg text-sm disabled:opacity-50 bg-gray-800 hover:bg-gray-700 text-button"
          onClick={onDeleteSelectedHandler}
        >
          <Trash2 size={14} className="mr-1" />
          <span>삭제</span>
        </button>

        {/* --- 상태 변경 드롭다운 --- */}
        <select
          disabled={selectedCount === 0 || disabled}
          className="border border-gray-700 rounded-lg py-1 px-2 text-sm disabled:opacity-50 bg-gray-800 text-gray-50"
          onChange={handleBulkStatusChange} //  onChange 핸들러 연결
          value={statusSelectValue} // value를 state와 연결
        >
          <option value="">상태 변경</option>
          {/*  상수를 순회하며 옵션 생성 */}
          {RESOURCE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Pagination Control  --- */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => {
            console.log('⏮️ 첫 페이지로 이동');
            table.setPageIndex(0);
          }} 
          disabled={!table.getCanPreviousPage() || disabled} 
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300" 
          aria-label="첫 페이지로 이동"
        > 
          <ChevronsLeft size={18} /> 
        </button>
        <button 
          onClick={() => {
            console.log('◀️ 이전 페이지로 이동');
            table.previousPage();
          }} 
          disabled={!table.getCanPreviousPage() || disabled} 
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300" 
          aria-label="이전 페이지로 이동"
        > 
          <ChevronLeft size={18} /> 
        </button>
        <span className="text-body-primary"> 페이지{' '} <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> {' / '} {table.getPageCount() || 1} </span>
        <button 
          onClick={() => {
            console.log('▶️ 다음 페이지로 이동:', {
              현재: table.getState().pagination.pageIndex,
              다음: table.getState().pagination.pageIndex + 1,
              전체: table.getPageCount(),
              canNext: table.getCanNextPage(),
            });
            table.nextPage();
          }} 
          disabled={!table.getCanNextPage() || disabled} 
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300" 
          aria-label="다음 페이지로 이동"
        > 
          <ChevronRight size={18} /> 
        </button>
        <button 
          onClick={() => {
            console.log('⏭️ 마지막 페이지로 이동');
            table.setPageIndex(table.getPageCount() - 1);
          }} 
          disabled={!table.getCanNextPage() || disabled} 
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300" 
          aria-label="마지막 페이지로 이동"
        > 
          <ChevronsRight size={18} /> 
        </button>
      </div>
    </div>
  );
}