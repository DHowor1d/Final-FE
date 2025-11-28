/**
 * @author 최산하
 */
import { flexRender } from '@tanstack/react-table';
import type {
  Table as TanStackTable,
  HeaderGroup,
  Row,
  Cell,
} from '@tanstack/react-table';
import type { Resource } from '../types/resource.types';
import { columns } from './resourceTable.config';


const SkeletonRow = () => {
  // 컬럼  개수만큼 스켈레톤 셀을 생성
  const cells = Array.from({ length: columns.length }, (_, i) => {
    const columnSize = columns[i]?.size || 120;
    return (
      <td key={i} className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: columnSize }}>
        <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
      </td>
    );
  });

  return <tr className="hover:bg-white/10">{cells}</tr>;
};


interface ResourceTableProps {
  table: TanStackTable<Resource>;
  isLoading: boolean;
}

export default function ResourceTable({ table, isLoading }: ResourceTableProps) {

  return (

    <div className="overflow-x-auto bg-gray-700/50 rounded-lg shadow-md border border-slate-300/40"> 
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-gray-600"> 
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<Resource>) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // 체크박스와 상태 컬럼은 overflow-hidden을 제거
                const isSelectColumn = header.column.id === 'select';
                const isStatusColumn = header.column.id === 'status';
                const shouldRemoveOverflow = isSelectColumn || isStatusColumn;
                
                return (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-300/40 ${
                      shouldRemoveOverflow ? '' : 'overflow-hidden text-ellipsis'
                    }`}
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>


        <tbody className="divide-y divide-slate-300/40"> 
          {isLoading ? (
            // (스켈레톤 UI)
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : table.getRowModel().rows.length > 0 ? (
            // (데이터가 있을 때)
            table.getRowModel().rows.map((row: Row<Resource>) => (

              <tr key={row.id} className="hover:bg-white/10"> 
                {row.getVisibleCells().map((cell: Cell<Resource, unknown>) => {
                  // 체크박스와 상태 컬럼은 overflow-hidden을 제거하여 잘리지 않도록
                  const isSelectColumn = cell.column.id === 'select';
                  const isStatusColumn = cell.column.id === 'status';
                  const shouldRemoveOverflow = isSelectColumn || isStatusColumn;
                  
                  return (
                    <td
                      key={cell.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${
                        shouldRemoveOverflow ? '' : 'overflow-hidden text-ellipsis'
                      }`}
                      style={{ width: cell.column.columnDef.size }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            // (데이터가 없을 때)
            <tr>
              <td
                colSpan={columns.length}
                // 빈 테이블 텍스트 색상
                className="text-center py-10 text-gray-500 text-placeholder" >
                표시할 자원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}