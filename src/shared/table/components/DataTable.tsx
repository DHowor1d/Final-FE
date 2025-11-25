import { flexRender } from '@tanstack/react-table';
import type {
  HeaderGroup,
  Row,
  Cell,
} from '@tanstack/react-table';
import type { DataTableProps } from '../types/table';
import TableSkeleton from './TableSkeleton';
import TableEmpty from './TableEmpty';

/**
 * 재사용 가능한 제네릭 데이터 테이블 컴포넌트
 * 
 * @template TData - 테이블 데이터 타입
 * @param table - TanStack Table 인스턴스
 * @param columns - 컬럼 정의 배열
 * @param isLoading - 로딩 상태
 * @param isError - 에러 상태
 * @param emptyMessage - 빈 상태 메시지
 * @param errorMessage - 에러 메시지
 * @param skeletonRows - 스켈레톤 행 개수
 */
export default function DataTable<TData>({
  table,
  columns,
  isLoading = false,
  isError = false,
  emptyMessage = '표시할 데이터가 없습니다.',
  errorMessage = '데이터 로딩 중 오류가 발생했습니다.',
  skeletonRows = 5,
}: DataTableProps<TData>) {
  const columnCount = columns.length;

  return (
    <div className="overflow-x-auto bg-gray-700/50 rounded-lg shadow-md border border-slate-300/40">
      <table className="min-w-full" style={{ tableLayout: 'fixed' }}>
        {/* 테이블 헤더 */}
        <thead className="bg-gray-600">
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-300/40 overflow-hidden text-ellipsis"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* 테이블 바디 */}
        <tbody className="divide-y divide-slate-300/40">
          {isLoading ? (
            // 로딩 상태: 스켈레톤 UI
            <TableSkeleton rows={skeletonRows} columns={columnCount} />
          ) : isError ? (
            // 에러 상태
            <tr>
              <td
                colSpan={columnCount}
                className="text-center py-10 text-red-400 text-placeholder"
              >
                {errorMessage}
              </td>
            </tr>
          ) : table.getRowModel().rows.length > 0 ? (
            // 데이터 있음
            table.getRowModel().rows.map((row: Row<TData>) => (
              <tr key={row.id} className="hover:bg-gray-700">
                {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-50 overflow-hidden text-ellipsis"
                    style={{ width: cell.column.columnDef.size }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // 데이터 없음
            <TableEmpty message={emptyMessage} colSpan={columnCount} />
          )}
        </tbody>
      </table>
    </div>
  );
}
