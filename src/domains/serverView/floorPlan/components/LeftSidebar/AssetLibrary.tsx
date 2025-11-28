/**
 * @author 최산하
 * @description 장비 라이브러리 컴포넌트 - 배치 가능한 장비 목록을 제공하고 드래그 앤 드롭 기능을 지원
 * 서버 랙, 냉각기, 도어 등 서버실 구성에 필요한 3D 장비 템플릿 데이터(EQUIPMENT_LIBRARY) 관리
 * @dnd-kit/core의 useDraggable 훅을 사용하여 장비 아이템의 드래그 소스(Source) 기능 구현
 * 각 장비의 아이콘, 이름, 기본 속성(크기, 색상)을 시각적으로 렌더링
 * 마우스 호버 및 드래그 상태에 따른 직관적인 UI 인터랙션 제공
 */
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Asset, UHeight } from '../../types';
import {
  Server,
  DoorOpen,
  Wind,
  Snowflake,
  Flame,
  Thermometer,
} from 'lucide-react';

interface LibraryAssetTemplate
  extends Omit<Asset, 'id' | 'gridX' | 'gridY' | 'uHeight'> {
  icon: React.ReactNode;
  uHeight?: UHeight;
}

// 3D 뷰와 동일한 장비 목록
const EQUIPMENT_LIBRARY: LibraryAssetTemplate[] = [
  {
    layer: 'floor',
    assetType: 'rack',
    name: '서버 랙',
    widthInCells: 1,
    heightInCells: 1,
    icon: <Server />,
    customColor: '#dbe4ff',
    uHeight: 42,
    doorDirection: 'south',
  },
  {
    layer: 'wall',
    assetType: 'door_single',
    name: '문',
    widthInCells: 1,
    heightInCells: 0.25,
    icon: <DoorOpen />,
    customColor: '#ced4da',
    doorDirection: 'south',
  },
  {
    layer: 'floor',
    assetType: 'crac',
    name: '항온항습기',
    widthInCells: 1,
    heightInCells: 1,
    icon: <Wind />,
    customColor: '#a7d8de',
  },
  {
    layer: 'floor',
    assetType: 'fire_suppression',
    name: '소화기',
    widthInCells: 1,
    heightInCells: 1,
    icon: <Flame />,
    customColor: '#ffc9c9',
  },
  {
    layer: 'overhead',
    assetType: 'leak_sensor',
    name: '온도계',
    widthInCells: 1,
    heightInCells: 1,
    icon: <Thermometer />,
    customColor: '#ffe066',
  },
  {
    layer: 'floor',
    assetType: 'in_row_cooling',
    name: '에어컨',
    widthInCells: 1,
    heightInCells: 1,
    icon: <Snowflake />,
    customColor: '#c1dbe8',
  },
];

const DraggableAsset = ({
  template,
}: {
  template: LibraryAssetTemplate;
}) => {
  const { icon, ...assetData } = template;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${template.assetType}-${template.name}`,
    data: assetData,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        cursor: 'grabbing',
      }
    : {
        cursor: 'grab',
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-full bg-gray-700/70 hover:bg-gray-600 text-white rounded-lg p-4 
                 transition-all duration-200 hover:shadow-lg
                 border border-gray-600 hover:border-slate-300/40
                 flex items-center gap-3 group cursor-grab active:cursor-grabbing"
    >
      <span className="text-2xl transition-transform">
        {icon}
      </span>
      <div className="flex-1 text-left">
        <div className="font-semibold text-sm">{template.name}</div>
        <div className="text-xs text-gray-400 mt-1">
          드래그하여 추가
        </div>
      </div>
    </div>
  );
};

const AssetLibrary: React.FC = () => {
  return (
    <div className="asset-library-container">
      <h3 className="sidebar-subtitle text-heading mb-4">장비 목록</h3>
      <div className="asset-list-scroll-container">
        <div className="flex flex-col gap-3">
          {EQUIPMENT_LIBRARY.map((template) => (
            <DraggableAsset
              key={`${template.assetType}-${template.name}`}
              template={template}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;