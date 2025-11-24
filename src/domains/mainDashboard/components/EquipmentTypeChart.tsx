import { Cpu } from "lucide-react";
import ReactECharts from "echarts-for-react";

interface EquipmentTypeData {
  type: string;
  count: number;
}

interface EquipmentTypeChartProps {
  data: EquipmentTypeData[];
}

// 장비 타입별 색상 매핑
const EQUIPMENT_TYPE_COLORS: Record<string, string> = {
  SERVER: "#3b82f6", // blue-500
  STORAGE: "#8b5cf6", // violet-500
  SWITCH: "#10b981", // emerald-500
  ROUTER: "#f59e0b", // amber-500
  LOAD_BALANCER: "#ec4899", // pink-500
  FIREWALL: "#ef4444", // red-500
  KVM: "#14b8a6", // teal-500
  PDU: "#f97316", // orange-500
};

// 장비 타입 한글 이름 매핑
const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  SERVER: "서버",
  STORAGE: "스토리지",
  SWITCH: "스위치",
  ROUTER: "라우터",
  LOAD_BALANCER: "로드밸런서",
  FIREWALL: "방화벽",
  KVM: "KVM",
  PDU: "PDU",
};

export default function EquipmentTypeChart({ data }: EquipmentTypeChartProps) {
  // 차트 데이터 변환
  const chartData = data.map((item) => ({
    name: EQUIPMENT_TYPE_LABELS[item.type] || item.type,
    value: item.count,
    itemStyle: {
      color: EQUIPMENT_TYPE_COLORS[item.type] || "#6b7280",
    },
  }));

  const totalEquipments = data.reduce((sum, item) => sum + item.count, 0);

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}대 ({d}%)",
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      textStyle: {
        color: "#f3f4f6",
      },
    },
    legend: {
      orient: "horizontal",
      bottom: "0%",
      textStyle: {
        color: "#d1d5db",
        fontSize: 12,
      },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#1f2937",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data: chartData,
      },
    ],
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={20} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-300">장비 타입별 구성</h3>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gray-100">{totalEquipments}대</span>
        <span className="text-xs text-gray-400">총 장비 수</span>
      </div>

      <ReactECharts option={option} style={{ height: "250px" }} />
    </div>
  );
}

