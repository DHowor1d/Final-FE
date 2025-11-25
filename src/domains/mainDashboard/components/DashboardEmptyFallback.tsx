import { PackageOpen } from 'lucide-react';

interface DashboardEmptyFallbackProps {
  error: Error;
}

/**
 * 메인 대시보드 전용 Empty State Fallback
 * 장비가 없는 경우 표시되는 UI
 */
function DashboardEmptyFallback({ error }: DashboardEmptyFallbackProps) {
  // 에러 메시지에서 어떤 위치인지 파악
  let title = '배치된 장비가 없습니다';
  let message = '이 위치에 장비를 배치하면 실시간 모니터링 데이터를 확인할 수 있습니다.';

  if (error.message.includes('데이터센터')) {
    title = '데이터센터에 배치된 장비가 없습니다';
    message = '서버실에 장비를 배치하면 데이터센터의 실시간 모니터링 데이터를 확인할 수 있습니다.';
  } else if (error.message.includes('서버실')) {
    title = '서버실에 배치된 장비가 없습니다';
    message = '랙에 장비를 배치하면 서버실의 실시간 모니터링 데이터를 확인할 수 있습니다.';
  } else if (error.message.includes('랙')) {
    title = '랙에 배치된 장비가 없습니다';
    message = '이 랙에 장비를 배치하면 실시간 모니터링 데이터를 확인할 수 있습니다.';
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 h-full min-h-full">
      <PackageOpen className="w-20 h-20 text-gray-600 mb-6" strokeWidth={1.5} />
      
      <h2 className="text-2xl font-semibold text-gray-300 mb-3">
        {title}
      </h2>
      
      <p className="text-gray-400 text-center max-w-md leading-relaxed">
        {message}
      </p>

      <div className="mt-8 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
        <p className="text-sm text-gray-500 text-center">
          💡 장비 배치는 <span className="text-blue-400">서버실 뷰</span>에서 할 수 있습니다
        </p>
      </div>
    </div>
  );
}

export default DashboardEmptyFallback;
