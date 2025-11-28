/**
 * @author dhowor1d
 * @description 리소스 관리 페이지 - 서버 및 네트워크 장비 등 IT 리소스를 관리하는 페이지
 * 리소스 목록 조회, 필터링, 추가, 수정, 삭제 기능 제공
 * 위저드 형식의 모달로 리소스 생성 프로세스 간소화
 * 상태별 필터링, 검색, 일괄 작업(삭제, 상태 변경) 기능 지원
 * 서버실별 리소스 분류 및 관리
 */

import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import type {
  PaginationState,
  RowSelectionState,
  SortingState
} from '@tanstack/react-table';
import { Plus, Loader2 } from 'lucide-react';

import ResourceFilters from '../components/ResourceFilters';
import ResourceTable from '../components/ResourceTable';
import ResourcePaginationActions from '../components/ResourcePaginationActions';
import ResourceWizardModal from '../components/ResourceWizardModal';
import { columns } from '../components/resourceTable.config';
import {
  useGetResourceList,
  useDeleteResource,
  useDeleteMultipleResources,
  useUpdateMultipleResourceStatus,
  useGetServerRoomsByCompany,
  RESOURCE_QUERY_KEY // import 추가 확인
} from '../hooks/useResourceQueries';
import { useAuthStore } from '@domains/login/store/useAuthStore';
import type { ResourceListFilters, Resource, ResourceTableMeta, PaginatedResourceResponse, ResourceStatus } from '../types/resource.types';
import { useDebounce } from '../hooks/useDebounce';
import { RESOURCE_STATUS_LABELS } from '../constants/resource.constants';
import { ConfirmationModal } from '@shared/ConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Snackbar from '@shared/Snackbar';

/**
 * @function ResourceManagePage
 * @description 리소스 관리 페이지 컴포넌트 - IT 자산 목록 관리 및 CRUD 작업
 * @returns {JSX.Element} 리소스 관리 페이지 UI
 */
export default function ResourceManagePage() {
  const queryClient = useQueryClient();
  
  // 로그인한 사용자의 회사 ID 가져오기
  const { user } = useAuthStore();
  const companyId = user?.companyId ?? null;
  
  // --- 상태 관리 ---
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // 페이지네이션 변경 핸들러 (디버깅용)
  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    console.log('🔧 setPagination 호출됨:', updater);
    
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    console.log('📍 이전 pagination:', pagination);
    console.log('📍 새로운 pagination:', newPagination);
    
    setPagination(newPagination);
  };

  // 검색/필터 상태
  const [keyword, setkeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState("");
  const [serverRoomFilter, setServerRoomFilter] = useState("");
  const [errorToastId, setErrorToastId] = useState<string | null>(null);

  // --- [중요 수정] 로그인한 사용자의 회사에 해당하는 서버실 데이터 로딩 ---
  const { 
    data: serverRoomGroups, 
    isLoading: isLoadingServerRooms 
  } = useGetServerRoomsByCompany(companyId);

  // API 호출 지연을 위한 Debounce
  const debouncedkeyword = useDebounce(keyword, 300);

  // API에 전달할 필터 객체 (Memoize)
  const filters = useMemo((): ResourceListFilters => ({
    keyword: debouncedkeyword,
    status: statusFilter,
    type: typeFilter,
    serverRoomId: serverRoomFilter,
  }), [debouncedkeyword, statusFilter, typeFilter, serverRoomFilter]);

  // --- 데이터 페칭 ---
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useGetResourceList(
    pagination.pageIndex,
    pagination.pageSize,
    filters
  );

  // 페이지 변경 시 로그
  useEffect(() => {
    console.log('🔄 페이지 변경 감지:', {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    });
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    if (isError && !isFetching && !errorToastId) {
      const id = toast.custom(
        (t) => (
          <Snackbar
            t={t}
            message="목록을 불러오지 못했습니다."
            actionText="다시 시도"
            onAction={() => {
              refetch();
              toast.dismiss(t.id);
              setErrorToastId(null);
            }}
          />
        ),
        { duration: Infinity },
      );
      setErrorToastId(id);
    } else if ((!isError || isFetching) && errorToastId) {
      toast.dismiss(errorToastId);
      setErrorToastId(null);
    }
  }, [isError, isFetching, refetch, errorToastId]);

  // [삭제됨] 여기에 있던 중복된 useGetServerRooms 호출 코드를 제거했습니다.

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    resource?: Resource;
    isBulk?: boolean;
  }>({ isOpen: false });

  const deleteResourceMutation = useDeleteResource();
  const deleteMultipleResourcesMutation = useDeleteMultipleResources();
  const updateStatusMutation = useUpdateMultipleResourceStatus();

  const resourceData = paginatedData?.content ?? [];
  const totalPageCount = paginatedData?.totalPages ?? 0;

  // 디버깅: 페이지네이션 정보 로그
  useEffect(() => {
    if (paginatedData) {
      console.log('📊 페이지네이션 정보:', {
        현재페이지: pagination.pageIndex + 1,
        전체페이지: paginatedData.totalPages,
        페이지크기: pagination.pageSize,
        전체항목수: paginatedData.totalElements,
        현재페이지항목수: paginatedData.content.length,
      });
    }
  }, [paginatedData, pagination.pageIndex, pagination.pageSize]);

  // --- 이벤트 핸들러 ---
  const addResourceHandler = () => {
    setSelectedResourceId(null);
    setIsModalOpen(true);
  };

  const editResourceHandler = (resource: Resource) => {
    setSelectedResourceId(resource.id);
    setIsModalOpen(true);
  };

  const deleteResourceHandler = (resourceId: number) => {
    deleteResourceMutation.mutate(resourceId);
  };
  const openDeleteModal = (resource: Resource) => {
    setDeleteModalState({ isOpen: true, resource });
  };
  const openBulkDeleteModal = () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      alert("삭제할 자산을 선택해주세요.");
      return;
    }
    setDeleteModalState({ isOpen: true, isBulk: true });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false });
  };

  const handleConfirmDelete = () => {
    const queryKey = [
      RESOURCE_QUERY_KEY,
      pagination.pageIndex,
      pagination.pageSize,
      filters,
    ];

    if (deleteModalState.resource) {
      const resource = deleteModalState.resource;
      closeDeleteModal();

      const deleteTimer = setTimeout(() => {
        deleteResourceMutation.mutate(resource.id);
      }, 5000);

      queryClient.setQueryData(
        queryKey,
        (oldData: PaginatedResourceResponse | undefined) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            content: oldData.content.filter((r) => r.id !== resource.id),
            totalElements: oldData.totalElements - 1,
          };
        },
      );
      
      toast.custom(
        (t) => (
          <Snackbar
            t={t}
            message="자원이 삭제되었습니다."
            actionText="실행 취소"
            onAction={() => {
              clearTimeout(deleteTimer);
              queryClient.invalidateQueries({ queryKey });
              toast.dismiss(t.id);
              toast.success('삭제가 취소되었습니다.');
            }}
          />
        ),
        { duration: 5000 },
      );
    } else if (deleteModalState.isBulk) {
      const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
      const selectedCount = selectedIds.length;
      closeDeleteModal();

      const deleteTimer = setTimeout(() => {
        deleteMultipleResourcesMutation.mutate(selectedIds, {
          onSuccess: () => {
            setRowSelection({});
            table.resetRowSelection();
          },
        });
      }, 5000);

      queryClient.setQueryData(
        queryKey,
        (oldData: PaginatedResourceResponse | undefined) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            content: oldData.content.filter((r) => !selectedIds.includes(r.id)),
            totalElements: oldData.totalElements - selectedCount,
          };
        },
      );

      toast.custom(
        (t) => (
          <Snackbar
            t={t}
            message={`${selectedCount}개 자원이 삭제되었습니다.`}
            actionText="실행 취소"
            onAction={() => {
              clearTimeout(deleteTimer);
              queryClient.invalidateQueries({ queryKey });
              toast.dismiss(t.id);
              toast.success('삭제가 취소되었습니다.');
            }}
          />
        ),
        { duration: 5000 },
      );
    }
  };

  const handleBulkStatusChange = (newStatus: ResourceStatus) => {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    const selectedCount = selectedIds.length;

    console.log('🔵 상태 변경 시작:', { selectedIds, newStatus, selectedCount });

    if (selectedCount === 0) {
      console.warn('⚠️ 선택된 항목이 없습니다.');
      return;
    }

    const queryKey = [
      RESOURCE_QUERY_KEY,
      pagination.pageIndex,
      pagination.pageSize,
      filters,
    ];

    console.log('🔑 Query Key:', queryKey);

    // 즉시 상태 변경하고 리렌더링 트리거
    const previousData = queryClient.getQueryData<PaginatedResourceResponse>(queryKey);
    console.log('📦 이전 데이터:', previousData);

    if (previousData) {
      const updatedContent = previousData.content.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: newStatus } : r,
      );
      
      const newData: PaginatedResourceResponse = {
        ...previousData,
        content: updatedContent,
      };

      console.log('✅ 새로운 데이터 설정:', newData);
      
      // 강제로 데이터 업데이트
      queryClient.setQueryData(queryKey, newData);
      
      // 즉시 refetch하여 리렌더링 보장
      queryClient.invalidateQueries({ 
        queryKey, 
        refetchType: 'none' // refetch하지 않고 단순히 stale 마킹
      });
    }

    const statusUpdateTimer = setTimeout(() => {
      console.log('⏰ 5초 경과, API 호출 시작');
      updateStatusMutation.mutate({ ids: selectedIds, status: newStatus }, {
        onSuccess: () => {
          console.log('✅ API 성공');
          // API 성공 후 모든 자원 쿼리 무효화하여 최신 데이터 가져오기
          queryClient.invalidateQueries({ queryKey: [RESOURCE_QUERY_KEY] });
        },
        onError: (error) => {
          console.error('❌ API 실패:', error);
          // API 실패 시 이전 데이터로 롤백
          queryClient.invalidateQueries({ queryKey: [RESOURCE_QUERY_KEY] });
        },
      });
    }, 5000);

    const statusLabel = RESOURCE_STATUS_LABELS[newStatus] || newStatus;
    toast.custom(
      (t) => (
        <Snackbar
          t={t}
          message={`${selectedCount}개 자산의 상태가 [${statusLabel}]로 변경되었습니다.`}
          actionText="실행 취소"
          onAction={() => {
            clearTimeout(statusUpdateTimer);
            queryClient.invalidateQueries({ queryKey: [RESOURCE_QUERY_KEY] });
            toast.dismiss(t.id);
            toast.success('상태 변경이 취소되었습니다.');
          }}
        />
      ),
      { duration: 5000 },
    );

    // 낙관적 업데이트 직후 선택 초기화
    setTimeout(() => {
      setRowSelection({});
      table.resetRowSelection();
    }, 100);
  };

  const closeModalHandler = () => {
    setIsModalOpen(false);
    setSelectedResourceId(null);
  };

  const table = useReactTable({
    data: resourceData,
    columns,
    state: { pagination, rowSelection, sorting },
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: totalPageCount,
    manualPagination: true,
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    meta: {
      editResourceHandler,
      deleteResourceHandler,
      openDeleteModal,
    } as ResourceTableMeta,
  });

  const isInitialLoading = isLoading;
  const isBackgroundFetching = isFetching && !isLoading;
  const isMutating = deleteMultipleResourcesMutation.isPending || updateStatusMutation.isPending;

  return (
    <div className="tab-layout">
      <header className="tab-header">
        <div>
          <h1 className="text-main-title tab-title">자원 관리 목록</h1>
          <p className="tab-subtitle text-body-primary text-gray-400">데이터 센터의 모든 하드웨어 자산을 효율적으로 관리하세요.</p>
        </div>
        <div className="flex items-center gap-4">
          {isBackgroundFetching && (
            <div className="flex items-center text-gray-400 text-sm">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span>갱신 중...</span>
            </div>
          )}
          <button onClick={addResourceHandler} className="btn-create px-4 py-3">
            <Plus size={18} className="inline mr-1" /> 자산 추가
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <ResourceFilters
          searchTerm={keyword}
          onSearchChange={setkeyword}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          serverRoomFilter={serverRoomFilter}
          onServerRoomChange={setServerRoomFilter}
          serverRoomGroups={serverRoomGroups}
          isLoadingServerRooms={isLoadingServerRooms}
        />

        <div className="mt-6">
          {isInitialLoading ? (
            <ResourceTable table={table} isLoading={true} />
          ) : (isError && !paginatedData?.content?.length) ? (
            <div className="text-center py-10 text-red-400 text-placeholder">
              데이터 로딩 중 오류가 발생했습니다.
            </div>
          ) : (
            <div className={isMutating ? "opacity-50 pointer-events-none" : ""}>
              <ResourceTable table={table} isLoading={false} />
            </div>
          )}
        </div>

        <div className="mt-6">
          <ResourcePaginationActions
            table={table}
            onDeleteSelectedHandler={openBulkDeleteModal}
            onStatusChangeSelectedHandler={handleBulkStatusChange}
            disabled={isInitialLoading || isMutating}
          />
        </div>
      </main>

      <ResourceWizardModal
        isOpen={isModalOpen}
        onCloseHandler={closeModalHandler}
        resourceId={selectedResourceId}
        isUnallocated={false} // 새 자산 추가 시에도 위치 할당 가능하게 설정
      />

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="자산 삭제"
        confirmText="삭제"
        isDestructive
      >
        {deleteModalState.isBulk
          ? `선택한 ${table.getSelectedRowModel().rows.length}개의 자산을 정말 삭제하시겠습니까?`
          : `[${deleteModalState.resource?.equipmentName}] 자산을 정말 삭제하시겠습니까?`}
        <br />
      </ConfirmationModal>
    </div>
  );
}