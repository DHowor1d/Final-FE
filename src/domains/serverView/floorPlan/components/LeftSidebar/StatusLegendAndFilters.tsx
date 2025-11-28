/**
 * @author 최산하
 * @description 대시보드 모니터링 필터 및 범례 제어 패널
 * 시각화 모드(Metric View) 전환: 기본 상태, CPU 상세, 히트맵(온도/전력) 등 뷰 변경
 * 심각도(Severity) 필터링: 위험, 주의, 정상 등 특정 상태의 장비만 필터링하여 표시
 * 자산 레이어(Asset Layer) 제어: 바닥, 벽, 천장 등 3D 레이어의 가시성 토글
 * 히트맵 모드의 경우 재클릭 시 기본 모드로 복귀하는 토글 로직 포함
 */
import React from 'react';
import { useFloorPlanStore,
   setDashboardMetricView, 
   toggleLayerVisibility, 
   toggleSeverityVisibility
  } from '../../store/floorPlanStore';
import type { DashboardMetricView, 
    AssetLayer,
 } from '../../types';


const LayerCheckbox = ({
label,
layerKey,
}: {
label: string;
layerKey: AssetLayer;
}) => {
const { visibleLayers } = useFloorPlanStore();
const isChecked = visibleLayers[layerKey];

const handleChange = () => {
 toggleLayerVisibility(layerKey);
};
 
 return (
  <label className="option-checkbox-label">
   <input
    type="checkbox"
    checked={isChecked}
    onChange={handleChange}
    className="option-checkbox-input"
   />
   <span className="option-checkbox-text text-body-primary">{label}</span>
  </label>
 );
};

// 라디오 버튼 항목 
const MetricViewRadio: React.FC<{
 label: string;
 value: DashboardMetricView;
 isChecked: boolean;
 onChange: () => void; 
}> = ({ label, value, isChecked, onChange }) => (
 <label className="option-radio-label">
  <input
   type="radio"
   name="metric-view"
   value={value}
   checked={isChecked}
   onChange={onChange} 
   className="option-radio-input"
  />
  <span className="option-radio-text text-body-primary">{label}</span>
 </label>
);

// 체크박스 항목 (Phase 2, 3)
const FilterCheckbox: React.FC<{
 label: string;
 isChecked: boolean;
 onChange: () => void;
}> = ({ label, isChecked, onChange }) => (
 <label className="option-checkbox-label">
  <input
   type="checkbox"
   checked={isChecked}
   onChange={onChange}
   className="option-checkbox-input"
  />
  <span className="option-checkbox-text text-body-primary">{label}</span>
 </label>
);

const StatusLegendAndFilters: React.FC = () => {
 // 스토어에서 현재 상태 가져오기
 const { dashboardMetricView,
  //  visibleLayers, 
   visibleSeverities } = useFloorPlanStore();
const handleMetricViewChange = (newView: DashboardMetricView) => {
  // 이미 선택된 뷰를 다시 클릭했는지 확인
  const isSameView = dashboardMetricView === newView;
  
  // 1. 이미 선택된 '히트맵'을 클릭한 경우 -> 'default'로 토글 오프
  if (isSameView && (newView === 'heatmapTemp' || newView === 'heatmapPower')) {
   setDashboardMetricView('default');
  } 
  // 2. 그 외의 경우 (다른 뷰 선택, 또는 일반 뷰 재클릭) -> 그냥 해당 뷰로 설정
  else {
   setDashboardMetricView(newView);
  }
 };
return (
  <div className="flex flex-col gap-6">
   {/* ... (상태 범례 섹션) ... */}

   <div className="option-section">
    <h4 className="option-section-title text-heading">표시 모드 (View Mode)</h4>
    <div className="option-group flex flex-col gap-2">
     <MetricViewRadio
      label="📊 임계값 (기본)"
      value="default"
      isChecked={dashboardMetricView === 'default'}
      onChange={() => handleMetricViewChange('default')}
     />
     
     <MetricViewRadio
      label="� CPU 상세"
      value="cpuDetail"
      isChecked={dashboardMetricView === 'cpuDetail'}
      onChange={() => handleMetricViewChange('cpuDetail')}
     />

     <MetricViewRadio
      label="⚡ 전력 / 네트워크"
      value="network"
      isChecked={dashboardMetricView === 'network'}
      onChange={() => handleMetricViewChange('network')}
     />
     <MetricViewRadio
      label="📦 자산 점유율"
      value="usage"
      isChecked={dashboardMetricView === 'usage'}
      onChange={() => handleMetricViewChange('usage')}
     />
     
     <hr className="border-gray-600 my-1" />

     <MetricViewRadio
      label="🌡️ 온도 히트맵"
      value="heatmapTemp"
      isChecked={dashboardMetricView === 'heatmapTemp'}
      onChange={() => handleMetricViewChange('heatmapTemp')}
     />
     <MetricViewRadio
      label="⚡ 전력 히트맵"
      value="heatmapPower"
      isChecked={dashboardMetricView === 'heatmapPower'}
      onChange={() => handleMetricViewChange('heatmapPower')}
     />
    </div>
   </div>

   {/* --- 심각도 필터 --- */}
   <div className="option-section">
    <h4 className="option-section-title text-heading">심각도 필터 (Severity)</h4>
    <div className="option-group">
     <FilterCheckbox
      label="위험 (Critical)"
      isChecked={visibleSeverities.danger}
      onChange={() => toggleSeverityVisibility('danger')}
     />
     <FilterCheckbox
      label="주의 (Warning)"
      isChecked={visibleSeverities.warning}
      onChange={() => toggleSeverityVisibility('warning')}
     />
     <FilterCheckbox
      label="정상 (Normal)"
      isChecked={visibleSeverities.normal}
      onChange={() => toggleSeverityVisibility('normal')}
     />
    </div>
   </div>

   {/* 자산 레이어 필터 */}
   <div className="option-section">
    <h4 className="option-section-title text-heading">자산 레이어 (Asset Layer)</h4>
    <div className="option-group">
     <LayerCheckbox
      label="하부 설비 (랙 등)"
      layerKey="floor"
     />
     <LayerCheckbox
      label="벽면 설비 (문 등)"
      layerKey="wall"
     />
     <LayerCheckbox
      label="상부 설비 (CCTV 등)"
      layerKey="overhead"
     />
     
    </div>
   </div>
  </div>
 );
};

export default StatusLegendAndFilters;