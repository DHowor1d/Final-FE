/**
 * @author dhowor1d
 * @description 서버룸 시각화 페이지 - 서버실의 2D/3D 뷰를 제공하는 페이지
 * 사용자가 2D 평면도 또는 3D 입체 뷰를 선택하여 서버실 내 장비 배치를 확인 가능
 * 실시간 통계 패널과 이력 패널을 함께 표시하여 서버실 상태를 모니터링
 */

import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ServerViewHeader from '../components/ServerViewHeader';
import ServerRoomStatsPanel from '../components/ServerRoomStatsPanel';
import ServerRoomHistoryPanel from '../components/ServerRoomHistoryPanel';
import BabylonDatacenterView from '../view3d/components/BabylonDatacenterView';
import RackModal from '../components/RackModal';
import FloorPlanPage from '../floorPlan/pages/FloorPlanPage';
import { ErrorBoundary, ErrorFallback } from '@/shared/error';

/**
 * @function ServerViewPage
 * @description 서버룸 뷰 페이지 컴포넌트 - 2D/3D 전환 가능한 서버실 시각화 제공
 * @returns {JSX.Element} 서버뷰 페이지 UI
 */
function ServerViewPage() {
  const { id } = useParams<{ id: string }>();
  const [viewDimension, setViewDimension] = useState<'2D' | '3D'>('3D');
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ServerViewHeader
        serverRoomId={id}
        viewDimension={viewDimension}
        onViewDimensionChange={setViewDimension}
      />
      <ErrorBoundary
        fallback={(error, resetError) => (
          <div className="flex-1 flex items-center justify-center bg-neutral-900">
            <ErrorFallback
              error={error}
              resetError={resetError}
              title={`${viewDimension === '3D' ? '3D 뷰' : '2D 뷰'}를 불러올 수 없습니다`}
              message="렌더링 중 문제가 발생했습니다. 다시 시도해 주세요."
            />
          </div>
        )}
      >
        {viewDimension === '3D' ? (
          <div className="flex-1 overflow-hidden relative">
            {id && <ServerRoomStatsPanel serverRoomId={Number(id)} />}
            {id && <ServerRoomHistoryPanel serverRoomId={Number(id)} />}
            <BabylonDatacenterView mode="view" serverRoomId={id} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            {id && <ServerRoomStatsPanel serverRoomId={Number(id)} />}
            {id && <ServerRoomHistoryPanel serverRoomId={Number(id)} />}
            <FloorPlanPage containerRef={canvasContainerRef} serverRoomId={id} />
          </div>
        )}
      </ErrorBoundary>

      {/* RackModal은 2D/3D 모두에서 사용 */}
      <RackModal />
    </div>
  );
}

export default ServerViewPage;

