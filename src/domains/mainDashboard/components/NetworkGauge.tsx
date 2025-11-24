import ProgressGauge from './ProgressGauge';
import { Network } from 'lucide-react';

interface NetworkGaugeProps {
  value: number;
}

export default function NetworkGauge({ value }: NetworkGaugeProps) {
  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
      <div className="flex items-center gap-2 mb-2">
        <Network size={20} className="text-green-400" />
        <h3 className="text-lg font-semibold text-gray-100">네트워크</h3>
      </div>
      <ProgressGauge value={value} title="평균 네트워크 사용률" />
    </div>
  );
}
