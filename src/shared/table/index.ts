/**
 * @author dhowor1d
 * @description 공용 테이블 컴포넌트 모듈 - TanStack Table 기반의 재사용 가능한 테이블 컴포넌트
 * 데이터 테이블, 페이지네이션, 체크박스, 스켈레톤, 빈 상태 컴포넌트를 포함
 * 인적자원 관리, 리소스 관리 등 여러 페이지에서 공통으로 사용
 * 정렬, 필터링, 행 선택 등의 기능을 표준화하여 제공
 */

export { default as DataTable } from './components/DataTable';
export { default as DataTablePagination } from './components/DataTablePagination';
export { default as TableHeaderCheckbox } from './components/TableHeaderCheckbox';
export { default as TableSkeleton } from './components/TableSkeleton';
export { default as TableEmpty } from './components/TableEmpty';

// 타입
export type {
  DataTableConfig,
  DataTableProps,
  DataTablePaginationProps,
  DataTableActionsProps,
  ExtendedTableMeta,
  TableSkeletonProps,
  TableEmptyProps,
} from './types/table';
