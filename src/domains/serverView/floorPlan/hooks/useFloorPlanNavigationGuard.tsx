/**
 * @author 최산하
 * @description 플로어 플랜 네비게이션 가드 훅 - 편집 모드에서 저장되지 않은 변경사항이 있을 경우 페이지 이탈을 방지
 * React Router의 `useBlocker`를 활용하여 내부 라우팅 이동 시 커스텀 확인 모달(ConfirmationModal)을 호출
 * 브라우저의 `beforeunload` 이벤트를 리스닝하여 새로고침이나 탭 닫기 시 네이티브 경고 대화상자 표시
 * 사용자가 이탈을 확정하면 편집 이력(Temporal History)을 초기화하고 네비게이션을 진행시키는 안전 장치 역할
 */
import { useEffect } from 'react';
import { useBlocker, useLocation } from 'react-router-dom';
import { useFloorPlanStore, useHasUnsavedChanges } from '../store/floorPlanStore';
import { useConfirmationModal } from './useConfirmationModal';

/**
 * FloorPlan 편집 시 페이지 이탈 방지
 * 커스텀 모달(useConfirmationModal)을 사용하여 사용자에게 확인을 받습니다.
 */
export const useFloorPlanNavigationGuard = () => {
  const location = useLocation();
  const mode = useFloorPlanStore((state) => state.mode);
  const hasUnsavedChanges = useHasUnsavedChanges();
  const clearTemporalHistory = useFloorPlanStore.temporal.getState().clear;
  
  // 커스텀 모달 훅 사용
  const { confirm } = useConfirmationModal();

  // 편집 모드이고, 저장 안 한 변경사항이 있으면 차단 대상
  const shouldBlock = mode === 'edit' && hasUnsavedChanges;

  // 1. React Router 네비게이션 차단 (뒤로가기, 링크 클릭 등)
  const blocker = useBlocker(
    ({ nextLocation }) =>
      shouldBlock && nextLocation.pathname !== location.pathname,
  );

  useEffect(() => {
    // 블로커 상태가 'blocked'가 되면 모달을 띄웁니다.
    if (blocker.state === 'blocked') {
      confirm({
        title: '저장되지 않은 변경사항',
        message: (
          <p>
            현재 편집 중인 내용이 저장되지 않았습니다.<br />
            페이지를 벗어나면 변경 사항이 <strong>삭제</strong>됩니다.<br />
            정말 나가시겠습니까?
          </p>
        ),
        confirmText: '나가기', // 파괴적 동작
        confirmAction: () => {
          // 확인 시: 히스토리 초기화 후 이동 진행
          clearTemporalHistory();
          blocker.proceed();
        },
        cancelAction: () => {
          // 취소 시: 블로커 리셋 (페이지 유지)
          blocker.reset();
        },
      });
    }
  }, [blocker, confirm, clearTemporalHistory]);

  // 2. 브라우저 네이티브 이탈 방지 (새로고침, 탭 닫기)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldBlock) {
        event.preventDefault();
        event.returnValue = '저장하지 않은 변경 사항이 있습니다.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock]);
};