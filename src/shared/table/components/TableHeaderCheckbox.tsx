import { useRef, useEffect } from 'react';
import type { Table } from '@tanstack/react-table';

interface TableHeaderCheckboxProps<TData> {
  table: Table<TData>;
}

/**
 * 테이블 헤더 전체 선택 체크박스 컴포넌트
 * - indeterminate 상태 지원 (일부 선택 시)
 * 
 * @param table - TanStack Table 인스턴스
 */
export default function TableHeaderCheckbox<TData>({ 
  table 
}: TableHeaderCheckboxProps<TData>) {
  const ref = useRef<HTMLInputElement>(null);
  const isSomeRowsSelected = table.getIsSomeRowsSelected();

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = isSomeRowsSelected;
    }
  }, [isSomeRowsSelected]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className="w-5 h-5 rounded border-gray-600 bg-gray-700 focus:ring-slate-300/40"
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  );
}
