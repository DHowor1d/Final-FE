import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import type { Datacenter, SelectedNode } from '../types/dashboard.types';
import { Database, Building2, Server } from 'lucide-react';

interface HierarchySidebarProps {
  datacenters: Datacenter[];
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode) => void;
  onServerRoomExpand?: (serverRoomId: number) => void; // 서버실 확장 시 랙 로드
  onDatacenterExpand?: (datacenterId: number) => void; // 데이터센터 확장 시 모든 서버실 랙 프리페치
}

export default function HierarchySidebar({ 
  datacenters, 
  selectedNode, 
  onSelectNode,
  onServerRoomExpand,
  onDatacenterExpand
}: HierarchySidebarProps) {
  const getSelectedItemId = () => {
    if (!selectedNode) return '';
    
    if (selectedNode.level === 'rack') {
      return `rack-${selectedNode.rackId}`;
    }
    if (selectedNode.level === 'serverRoom') {
      return `serverRoom-${selectedNode.serverRoomId}`;
    }
    return `datacenter-${selectedNode.datacenterId}`;
  };

  const handleItemClick = (itemId: string) => {
    const [type, id] = itemId.split('-');
    const numId = parseInt(id);

    if (type === 'datacenter') {
      // 데이터센터 클릭 시 모든 서버실 랙 정보 프리페치
      if (onDatacenterExpand) {
        onDatacenterExpand(numId);
      }
      onSelectNode({ level: 'datacenter', datacenterId: numId });
    } else if (type === 'serverRoom') {
      const datacenter = datacenters.find((dc) =>
        dc.serverRooms.some((sr) => sr.id === numId)
      );
      if (datacenter) {
        // 서버실 선택 시 랙 정보 로드
        if (onServerRoomExpand) {
          onServerRoomExpand(numId);
        }
        onSelectNode({
          level: 'serverRoom',
          datacenterId: datacenter.id,
          serverRoomId: numId,
        });
      }
    } else if (type === 'rack') {
      const datacenter = datacenters.find((dc) =>
        dc.serverRooms.some((sr) => sr.racks.some((r) => r.id === numId))
      );
      const serverRoom = datacenter?.serverRooms.find((sr) =>
        sr.racks.some((r) => r.id === numId)
      );
      if (datacenter && serverRoom) {
        onSelectNode({
          level: 'rack',
          datacenterId: datacenter.id,
          serverRoomId: serverRoom.id,
          rackId: numId,
        });
      }
    }
  };

  // 서버실/데이터센터 확장 이벤트 처리
  const handleItemExpansionToggle = (_event: React.SyntheticEvent | null, itemId: string, isExpanded: boolean) => {
    if (isExpanded) {
      const [type, id] = itemId.split('-');
      if (type === 'serverRoom' && onServerRoomExpand) {
        onServerRoomExpand(parseInt(id));
      } else if (type === 'datacenter' && onDatacenterExpand) {
        // 데이터센터 확장 시 모든 서버실 랙 정보 프리페치
        onDatacenterExpand(parseInt(id));
      }
    }
  };

  return (
    <div className="h-full bg-neutral-800 border-r border-neutral-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Database size={20} />
          인프라 관리
        </h2>

        <SimpleTreeView
          selectedItems={getSelectedItemId()}
          onItemClick={(_event, itemId) => handleItemClick(itemId)}
          onItemExpansionToggle={handleItemExpansionToggle}
          defaultExpandedItems={[`datacenter-${datacenters[0]?.id}`]}
          sx={{
            minHeight: 352,
            minWidth: 250,
            fontSize: '16px', // text-sm (14px)
            '& .MuiTreeItem-content': {
              padding: '6px 8px',
              paddingLeft:
                'calc(8px + var(--TreeView-itemChildrenIndentation) * var(--TreeView-itemDepth))',
              borderRadius: '6px',
              marginBottom: '2px',
              '&:hover': {
                backgroundColor: 'rgba(64, 64, 64, 0.8)',
              },
              '&.Mui-selected': {
                backgroundColor: '#16a34a !important',
                '&:hover': {
                  backgroundColor: '#15803d !important',
                },
              },
            },
            '& .MuiTreeItem-label': {
              fontSize: 'inherit', // 부모의 fontSize 상속
              color: '#d1d5db',
              paddingLeft: '4px',
            },
            '& .MuiTreeItem-iconContainer': {
              color: '#9ca3af',
              width: '24px',
              marginRight: '0',
            },
            '& .MuiTreeItem-group': {
              marginLeft: '20px',
              paddingLeft: '12px',
              borderLeft: '1px solid rgba(156, 163, 175, 0.2)',
            },
          }}
        >
          {datacenters.map((datacenter) => (
            <TreeItem
              key={datacenter.id}
              itemId={`datacenter-${datacenter.id}`}
              label={
                <div className="flex items-center gap-2">
                  <Building2 size={16} />
                  <span className="font-medium">{datacenter.name}</span>
                </div>
              }
            >
              {datacenter.serverRooms.map((serverRoom) => (
                <TreeItem
                  key={serverRoom.id}
                  itemId={`serverRoom-${serverRoom.id}`}
                  label={
                    <div className="flex items-center gap-2">
                      <Database size={16} />
                      <span>{serverRoom.name}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        ({serverRoom.racks.length})
                      </span>
                    </div>
                  }
                >
                  {serverRoom.racks.map((rack) => (
                    <TreeItem
                      key={rack.id}
                      itemId={`rack-${rack.id}`}
                      label={
                        <div className="flex items-center gap-2">
                          <Server size={14} />
                          <span>{rack.name}</span>
                          <span className="ml-auto text-xs text-gray-400">
                            ({rack.equipments?.length || 0})
                          </span>
                        </div>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
          ))}
        </SimpleTreeView>
      </div>
    </div>
  );
}
