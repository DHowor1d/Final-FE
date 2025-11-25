import type { ColumnDef } from '@tanstack/react-table';
import type { Member, MemberRole, MemberTableMeta } from '../types/memberTypes';
import { TableHeaderCheckbox } from '@/shared/table';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';

// 역할 Badge 색상 맵
const roleColorMap: Record<MemberRole, string> = {
  ADMIN: 'bg-purple-700 text-purple-100',
  OPERATOR: 'bg-blue-700 text-blue-100',
  VIEWER: 'bg-gray-700 text-gray-100',
};

// 역할 한글명 맵
const roleNameMap: Record<MemberRole, string> = {
  ADMIN: '관리자',
  OPERATOR: '운영자',
  VIEWER: '조회자',
};

/**
 * 회원 테이블 컬럼 정의
 */
export const memberColumns: ColumnDef<Member>[] = [
  // 선택 체크박스
  {
    id: 'select',
    header: ({ table }) => <TableHeaderCheckbox table={table} />,
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="w-5 h-5 rounded border-gray-600 bg-gray-700 focus:ring-slate-300/40"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  
  // ID
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => {
  //     return (
  //       <button
  //         className="flex items-center hover:text-gray-300 text-gray-400"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         ID
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </button>
  //     );
  //   },
  //   cell: ({ getValue }) => {
  //     return <span className="font-medium">{getValue<number>()}</span>;
  //   },
  // },
  
  // 사용자명
  {
    accessorKey: 'userName',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          사용자ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    size: 140,
  },
  
  // 이름
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          이름
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    size: 120,
  },
  
  // 이메일
  {
    accessorKey: 'email',
    header: 'email',
    cell: ({ getValue }) => {
      return <span>{getValue<string>()}</span>;
    },
    size: 200,
  },
  
  // 역할
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          역할
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const role = getValue<MemberRole>();
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roleColorMap[role]
          }`}
        >
          {roleNameMap[role]}
        </span>
      );
    },
    size: 110,
  },
  
  // 마지막 로그인
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          마지막 로그인
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ getValue }) => {
      const date = getValue<string | null>();
      if (!date) {
        return <span className="text-gray-500">-</span>;
      }
      return (
        <span>
          {new Date(date).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      );
    },
    size: 160,
  },
  
  // 관리 액션
  {
    id: 'actions',
    header: '관리',
    cell: ({ row, table }) => (
      <div className="flex gap-2 justify-start">
        <button
          className="text-gray-400 hover:text-blue-400"
          onClick={() =>
            (table.options.meta as MemberTableMeta)?.onEdit?.(row.original)
          }
          aria-label={`${row.original.name} 수정`}
        >
          <Pencil size={16} />
        </button>
        <button
          className="text-gray-400 hover:text-red-400"
          onClick={() =>
            (table.options.meta as MemberTableMeta)?.onDelete?.(row.original.id)
          }
          aria-label={`${row.original.name} 삭제`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
    enableSorting: false,
    size: 80,
  },
];
