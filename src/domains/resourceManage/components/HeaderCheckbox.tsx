/**
 * @author 최산하
 */
import { useRef, useEffect } from 'react';
import type { Table } from '@tanstack/react-table';
import type { Resource } from '../types/resource.types';

interface HeaderCheckboxProps {
  table: Table<Resource>;
}

// NOTE(user): 'indeterminate' prop은 React 컴포넌트에서 직접 사용
export default function HeaderCheckbox({ table }: HeaderCheckboxProps) {
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
      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  );
}