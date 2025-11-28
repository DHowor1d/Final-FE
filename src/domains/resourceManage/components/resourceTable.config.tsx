/**
 * @author 최산하
 */
import type { ColumnDef } from "@tanstack/react-table";
import type {
  Resource,
  ResourceStatus,
  ResourceTableMeta,
} from "../types/resource.types";
import HeaderCheckbox from "./HeaderCheckbox";
import { Pencil, Trash2, ArrowUpDown, AlertTriangle } from "lucide-react";
import { RESOURCE_STATUS_LABELS } from "../constants/resource.constants";

// 상태 Badge 다크 모드 색상 맵
const statusColorMap: Record<ResourceStatus, string> = {
  NORMAL: "bg-green-700 text-green-100",
  WARNING: "bg-yellow-600 text-yellow-100",
  ERROR: "bg-red-800 text-red-100",
  MAINTENANCE: "bg-orange-700 text-orange-100",
  POWERED_OFF: "bg-gray-700 text-gray-100",
  DECOMMISSIONED: "bg-red-700 text-red-100",
};

// NOTE(user): 컬럼 정의 (새 타입 기준)
export const columns: ColumnDef<Resource>[] = [
  {
    id: "select",
    header: ({ table }) => <HeaderCheckbox table={table} />,
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "equipmentName",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          장비명
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    size: 180,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          상태
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const resource = row.original;
      const status = resource.status;

      // "선배치 후등록" 필요 조건:
      // 위치(rackId)는 있는데, 상세 정보(예: modelName)가 없다.
      const needsDetails = resource.rackId != null && !resource.modelName;

      // 위 조건에 해당하면, "정보 필요" 배지를 노출
      if (needsDetails) {
        return (
          <div className="flex justify-start -ml-10">
            <span
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap min-w-[100px] ${
                statusColorMap["WARNING"] // '경고' 색상(노란색) 사용
              }`}
              title="상세 정보가 필요합니다."
            >
              <AlertTriangle size={12} />
              <span>정보 필요</span>
            </span>
          </div>
        );
      }

      // 일반적인 상태 배지
      return (
        <div className="flex justify-start -ml-10">
          <span
            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap min-w-[100px] text-center ${
              statusColorMap[status] ?? statusColorMap["POWERED_OFF"]
            }`}
          >
            {RESOURCE_STATUS_LABELS[status] || status}
          </span>
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: "ipAddress",
    header: "IP 주소",
    size: 140,
  },
  {
    accessorKey: "modelName",
    header: "모델명",
    size: 160,
  },
  {
    accessorKey: "manufacturer", //  제조사
    header: "제조사",
    size: 140,
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-gray-300 text-gray-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          위치
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const resource = row.original;
      
      // 백엔드에서 이미 조합된 location 문자열이 있다면 사용
      if (resource.location) {
        return resource.location;
      }
      
      // 없다면 프론트엔드에서 조합: "전산실명 > 랙명 (U:시작-끝)"
      const parts = [];
      
      // 전산실명 추가
      if (resource.serverRoomName) {
        parts.push(resource.serverRoomName);
      }
      
      // 랙명 추가
      if (resource.rackName) {
        if (parts.length > 0) {
          parts.push('>');
        }
        parts.push(resource.rackName);
      }
      
      // 유닛 정보 추가
      if (resource.startUnit) {
        const endUnit = resource.startUnit + (resource.unitSize || 1) - 1;
        const unitInfo = `(U:${resource.startUnit}-${endUnit})`;
        parts.push(unitInfo);
      }
      
      return parts.length > 0 ? parts.join(' ') : '-';
    },
    size: 200,
  },
  {
    id: "manage",
    header: "관리",
    cell: ({ row, table }) => (
      <div className="flex gap-2 justify-start">
        <button
          className="text-gray-400 hover:text-blue-400"
          onClick={() =>
            (table.options.meta as ResourceTableMeta)?.editResourceHandler(
              row.original
            )
          }
          aria-label={`${row.original.equipmentName} 수정`}
        >
          <Pencil size={16} />
        </button>
        <button
          className="text-gray-400 hover:text-red-400"
          onClick={() =>
            (table.options.meta as ResourceTableMeta)?.openDeleteModal(
              row.original
            )
          }
          aria-label={`${row.original.equipmentName} 삭제`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
    enableSorting: false,
    size: 80,
  },
];
