/**
 * @author 최산하
 */
import { Plus } from "lucide-react";
import { DataCenterTabDropdown } from "./DataCenterTabDropdown";
import type { DataCenterGroup } from "../types";

interface DataCenterTabsProps {
  dataCenters: DataCenterGroup[];
  selectedDataCenterId: number | null;
  onSelectDataCenter: (id: number) => void;
  onEditDataCenter: (dataCenter: DataCenterGroup) => void;
  onDeleteDataCenter: (dataCenter: DataCenterGroup) => void;
  onCreateDataCenter: () => void;
  userRole?: string;
}

export function DataCenterTabs({
  dataCenters,
  selectedDataCenterId,
  onSelectDataCenter,
  onEditDataCenter,
  onDeleteDataCenter,
  onCreateDataCenter,
  userRole,
}: DataCenterTabsProps) {
  return (
  <div className="datacenter-tabs">
    {dataCenters.map((dataCenter) => (
      <div
        key={dataCenter.dataCenterId}
        className={`datacenter-tab ${selectedDataCenterId === dataCenter.dataCenterId ? "active" : ""}`}
      >
        <button
          className="datacenter-tab-content"
          onClick={() => onSelectDataCenter(dataCenter.dataCenterId)}
        >
          <span>
            {dataCenter.dataCenterName} ({dataCenter.dataCenterCode})
          </span>
        </button>
        <DataCenterTabDropdown
          dataCenter={dataCenter}
          onEdit={onEditDataCenter}
          onDelete={onDeleteDataCenter}
        />
      </div>
    ))}
    {userRole !== 'VIEWER' && (
      <button className="datacenter-tab" onClick={onCreateDataCenter} title="새 데이터센터 추가">
        <Plus size={20} />
      </button>
    )}
  </div>
  );
}
