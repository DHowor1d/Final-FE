/**
 * @author dhowor1d
 * @description 인적자원 관리 페이지 - 회사 구성원을 관리하는 페이지
 * 회원 목록 조회, 검색, 추가, 수정, 삭제 기능 제공
 * 테이블 형식으로 데이터 표시, 페이지네이션 및 정렬 기능 포함
 * 개별 삭제 및 일괄 삭제 기능 지원
 */

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import type {
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';

import { DataTable, DataTablePagination } from '@/shared/table';
import { memberColumns } from '../components/memberTable.config';
import MemberFilters from '../components/MemberFilters';
import AddMemberModal from '../components/AddMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import DeleteMemberModal from '../components/DeleteMemberModal';
import BulkDeleteMemberModal from '../components/BulkDeleteMemberModal';
import {
  useGetMemberList,
  useDeleteMember,
  useDeleteMultipleMembers,
} from '../hooks/useMemberQueries';
import type { Member, MemberTableMeta } from '../types/memberTypes';

/**
 * @function HumanResource
 * @description 인적자원 관리 페이지 컴포넌트 - 회원 목록 관리 및 CRUD 작업 수행
 * @returns {JSX.Element} 인적자원 관리 페이지 UI
 */
export default function HumanResource() {
  // --- 상태 관리 ---
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // --- 데이터 페칭 ---
  const { data: memberData = [], isLoading, isError } = useGetMemberList();
  const deleteMemberMutation = useDeleteMember();
  const deleteMultipleMembersMutation = useDeleteMultipleMembers();

  // 검색 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!searchTerm) return memberData;
    
    const lowerSearch = searchTerm.toLowerCase();
    return memberData.filter((member) => {
      return (
        member.name.toLowerCase().includes(lowerSearch) ||
        member.userName.toLowerCase().includes(lowerSearch) ||
        member.email.toLowerCase().includes(lowerSearch)
      );
    });
  }, [memberData, searchTerm]);

  // --- 이벤트 핸들러 ---
  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteMember = (id: number) => {
    const member = memberData.find((m) => m.id === id);
    if (member) {
      setMemberToDelete({ id: member.id, name: member.name });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      deleteMemberMutation.mutate(memberToDelete.id);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleDeleteSelected = () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (selectedIds.length === 0) {
      alert('삭제할 회원을 선택해주세요.');
      return;
    }

    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    deleteMultipleMembersMutation.mutate(selectedIds, {
      onSuccess: () => {
        setRowSelection({});
        table.resetRowSelection();
        setIsBulkDeleteModalOpen(false);
      },
    });
  };

  // --- 테이블 인스턴스 ---
  const table = useReactTable({
    data: filteredData,
    columns: memberColumns,
    state: { pagination, rowSelection, sorting },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    meta: {
      onEdit: handleEditMember,
      onDelete: handleDeleteMember,
    } as MemberTableMeta,
  });

  const isMutating = deleteMultipleMembersMutation.isPending;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="tab-layout">
      {/* 헤더 */}
      <header className="tab-header">
        <div>
          <h1 className="text-main-title tab-title">회원 관리</h1>
          <p className="tab-subtitle text-body-primary text-gray-400">
            시스템 사용자 및 권한을 관리하세요.
          </p>
        </div>

        <button onClick={handleAddMember} className="btn-create px-4 py-3">
          <Plus size={18} className="inline mr-1" />
          회원 추가
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* 검색 필터 */}
        <MemberFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* 대량 작업 버튼 */}
        {selectedCount > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-body-primary">
              {selectedCount}명 선택됨:
            </span>
            <button
              disabled={isMutating}
              className="flex items-center px-3 py-1 border border-gray-700 rounded-lg text-sm disabled:opacity-50 bg-gray-800 hover:bg-gray-700 text-button"
              onClick={handleDeleteSelected}
            >
              <Trash2 size={14} className="mr-1" />
              <span>선택 삭제</span>
            </button>
          </div>
        )}

        {/* 테이블 */}
        <div className={isMutating ? 'opacity-50 pointer-events-none' : ''}>
          <DataTable
            table={table}
            columns={memberColumns}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="등록된 회원이 없습니다."
            errorMessage="회원 목록을 불러오는 중 오류가 발생했습니다."
            skeletonRows={10}
          />
        </div>

        {/* 페이지네이션 */}
        <DataTablePagination
          table={table}
          showSelectedCount={false}
          showPageSizeSelector={true}
          pageSizeOptions={[10, 20, 30, 50]}
          disabled={isLoading || isMutating}
        />
      </main>

      {/* 회원 추가 모달 */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* 회원 수정 모달 */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />

      {/* 단일 회원 삭제 확인 모달 */}
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDeleteMember}
        memberName={memberToDelete?.name || ''}
        isLoading={deleteMemberMutation.isPending}
      />

      {/* 대량 삭제 확인 모달 */}
      <BulkDeleteMemberModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        selectedCount={selectedCount}
        isLoading={deleteMultipleMembersMutation.isPending}
      />
    </div>
  );
}