interface TopEquipment {
  equipmentId: number;
  equipmentName: string;
  value: number;
}

interface TopEquipmentsTableProps {
  title: string;
  data: TopEquipment[];
  unit?: string;
  icon?: React.ReactNode;
  valueFormatter?: (value: number) => string;
}

export default function TopEquipmentsTable({
  title,
  data,
  unit = "%",
  icon,
  valueFormatter,
}: TopEquipmentsTableProps) {
  const formatValue = (value: number) => {
    if (valueFormatter) {
      return valueFormatter(value);
    }
    return `${value.toFixed(2)}${unit}`;
  };

  const getValueColor = (value: number, index: number) => {
    if (unit === "%" && value >= 80) return "text-red-400";
    if (unit === "%" && value >= 60) return "text-yellow-400";
    if (index === 0) return "text-blue-400";
    return "text-gray-300";
  };


  if (!data || data.length === 0) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
      </div>

      <div className="space-y-2">
        {data.map((equipment, index) => (
          <div
            key={equipment.equipmentId}
            className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-700 hover:border-neutral-600 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-400 w-4">
                  #{index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {equipment.equipmentName}
                </p>
                <p className="text-xs text-gray-500">ID: {equipment.equipmentId}</p>
              </div>
            </div>
            <div className={`text-sm font-bold ${getValueColor(equipment.value, index)}`}>
              {formatValue(equipment.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
