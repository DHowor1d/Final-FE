/**
 * @author 최산하
 * @description ServerView(Floor Plan) 전용 확인 모달 래퍼 컴포넌트
 * 전역 상태 관리 훅인 'useModalStore'와 공통 UI 컴포넌트 'ConfirmationModal'을 연결하는 브릿지 역할
 * 스토어의 상태(isOpen, title, message)를 구독하여 모달의 렌더링 여부 및 컨텐츠 제어
 * 확인 버튼 텍스트('삭제', '나가기')를 분석하여 파괴적 액션(isDestructive) 여부를 자동으로 판단 및 스타일 적용
 */
import { ConfirmationModal } from '@shared/ConfirmationModal'; 

import { useModalStore } from '../hooks/useConfirmationModal';

/**
 * serverView(floorPlan) 전용으로 사용되는
 * 'useModalStore' 기반의 모달 Wrapper입니다.
 */
export const FloorPlanConfirmationModal: React.FC = () => {
  // 3. 스토어에서 모든 상태와 액션을 가져옵니다.
  const {
    isOpen,
    title,
    message,
    confirmText,
    confirmAction,
    cancelAction,
  } = useModalStore();

  if (!isOpen) return null;

  const isDestructive =
    confirmText.includes('삭제') || confirmText.includes('나가기');

  // 4. "진짜" 공통 모달(UI)에 스토어의 상태와 액션을 Props로 연결합니다.
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={cancelAction}  // Store의 'cancel'을 공통 모달의 'onClose'에 연결
      onConfirm={confirmAction} // Store의 'confirm'을 공통 모달의 'onConfirm'에 연결
      title={title}
      confirmText={confirmText}
      isDestructive={isDestructive}
    >
      {message} 
    </ConfirmationModal>
  );
};