import { useState, useEffect } from 'react';
import HierarchySidebar from '../components/HierarchySidebar';
import Breadcrumb from '../components/Breadcrumb';
import DatacenterDashboard from '../components/DatacenterDashboard';
import ServerRoomDashboard from '../components/ServerRoomDashboard';
import RackDashboard from '../components/RackDashboard';
import { useDashboardData } from '../hooks/useDashboardData';
import type { SelectedNode } from '../types/dashboard.types';

function MainDashboard() {
  const COMPANY_ID = 1; // TODO: 실제 로그인 회사 ID로 교체
  
  const { datacenters, isLoading, error, loadServerRoomRacks, prefetchDatacenterRacks } = useDashboardData(COMPANY_ID);

  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  // 데이터센터가 로드되면 첫 번째 데이터센터 자동 선택
  useEffect(() => {
    if (datacenters && datacenters.length > 0 && !selectedNode) {
      setSelectedNode({
        level: 'datacenter',
        datacenterId: datacenters[0].id,
      });
      // 첫 번째 데이터센터의 랙 정보 프리페치
      prefetchDatacenterRacks(datacenters[0].id);
    }
  }, [datacenters, selectedNode, prefetchDatacenterRacks]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900">
        <div className="text-red-400">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 데이터센터가 없는 경우
  if (!datacenters || datacenters.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900">
        <div className="text-gray-400">등록된 데이터센터가 없습니다.</div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!selectedNode) return null;
    
    const datacenter = datacenters.find((dc) => dc.id === selectedNode.datacenterId);
    if (!datacenter) return <div className="text-gray-400">데이터센터를 찾을 수 없습니다.</div>;

    if (selectedNode.level === 'datacenter') {
      return <DatacenterDashboard datacenterId={datacenter.id} />;
    }

    if (selectedNode.level === 'serverRoom' && selectedNode.serverRoomId) {
      return <ServerRoomDashboard serverRoomId={selectedNode.serverRoomId} />;
    }

    if (selectedNode.level === 'rack' && selectedNode.serverRoomId && selectedNode.rackId) {
      return <RackDashboard rackId={selectedNode.rackId} />;
    }

    return null;
  };

  // 서버실 확장/선택 시 랙 정보 로드
  const handleServerRoomExpand = (serverRoomId: number) => {
    loadServerRoomRacks(serverRoomId);
  };

  // 데이터센터 확장/선택 시 모든 서버실의 랙 정보 프리페치
  const handleDatacenterExpand = (datacenterId: number) => {
    prefetchDatacenterRacks(datacenterId);
  };

  return (
    <div className="flex h-screen bg-neutral-900">
      {/* 왼쪽 사이드바 */}
      <div className="w-74 flex-shrink-0">
        {selectedNode && (
          <HierarchySidebar
            datacenters={datacenters}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onServerRoomExpand={handleServerRoomExpand}
            onDatacenterExpand={handleDatacenterExpand}
          />
        )}
      </div>

      {/* 오른쪽 대시보드 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNode && (
          <>
            <Breadcrumb selectedNode={selectedNode} datacenters={datacenters} />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-6">{renderDashboard()}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;