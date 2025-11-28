/**
 * @author 최산하
 * @description 속성 뷰어 컴포넌트 - 선택된 자산의 상세 정보를 읽기 전용으로 표시
 * 실시간 상태(정상/주의/위험)를 시각적 인디케이터(색상 점)로 표현
 * 온도 등 센서 데이터 및 자산 ID, 타입 등 기본 메타데이터 제공
 * 랙(Rack) 타입의 경우 내부 마운트 장비를 확인할 수 있는 상세 모달 연동(openRackModal) 지원
 */

import { useFloorPlanStore } from '../../store/floorPlanStore';
import type { Asset } from '../../types';
import { useBabylonDatacenterStore } from '@/domains/serverView/view3d/stores/useBabylonDatacenterStore';

// 상태 값에 따라 한글 이름과 CSS 클래스를 반환하는 헬퍼 함수
const getStatusInfo = (status: Asset['status']) => {
  switch (status) {
    case 'normal':
      return { text: '정상', className: 'status-dot-normal' };
    case 'warning':
      return { text: '주의', className: 'status-dot-warning' };
    case 'danger':
      return { text: '위험', className: 'status-dot-danger' };
    default:
      return { text: '알 수 없음', className: 'status-dot-unknown' };
  }
};

const PropertiesViewer: React.FC = () => {
  const { assets, selectedAssetIds } = useFloorPlanStore();

  const openRackModal = useBabylonDatacenterStore((state) => state.openRackModal);

  const selectedAsset = selectedAssetIds.length > 0
    ? assets.find((asset) => asset.id === selectedAssetIds[0])
    : null;

  if (!selectedAsset) {
    return (
      <div className="properties-placeholder">
        <p className="placeholder-text text-placeholder">자산을 클릭하면 정보가 표시됩니다.</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(selectedAsset.status);

  return (
    <div className="properties-viewer-container">
      <div className="viewer-header">
        <h3 className="viewer-title text-heading">속성 뷰어: {selectedAsset.name}</h3>
      </div>
      <div className="viewer-section">
        <h4 className="section-title text-heading">실시간 상태</h4>
        <div className="info-row">
          <span className="info-label text-label-form">상태</span>
          <div className="info-value">
            <span className={`status-dot ${statusInfo.className}`}></span>
            <span className="text-body-primary">{statusInfo.text}</span>
          </div>
        </div>
        {selectedAsset.data?.temperature !== undefined && (
          <div className="info-row">
            <span className="info-label text-label-form">온도</span>
            <span className="info-value text-body-primary">{selectedAsset.data.temperature}°C</span>
          </div>
        )}
      </div>
      <div className="viewer-section">
        <h4 className="section-title text-heading">기본 정보</h4>
        <div className="info-row">
            <span className="info-label text-label-form">자산 ID</span>
            <span className="info-value text-body-primary">{selectedAsset.id}</span>
        </div>
        <div className="info-row">
            <span className="info-label text-label-form">타입</span>
            <span className="info-value text-body-primary">{selectedAsset.assetType.toUpperCase()}</span>
        </div>
      </div>
      
      {selectedAsset.assetType === 'rack' && (
        <div className="viewer-footer">
            <button className="detail-button text-button"
            onClick={() => openRackModal(selectedAsset.id)} 
            >
              
            랙 상세 보기
            </button>
        </div>
      )}
    </div>
  );
};
export default PropertiesViewer;
