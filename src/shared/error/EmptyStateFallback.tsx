import { PackageOpen, RefreshCw } from 'lucide-react';

interface EmptyStateFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * 데이터 없음 상태를 표시하는 Fallback UI
 * 에러가 아닌 정상적인 빈 상태를 사용자에게 안내
 */
function EmptyStateFallback({ 
  title = '데이터가 없습니다',
  message = '이 위치에 배치된 장비가 없습니다.',
  onRetry,
  showRetry = true,
}: EmptyStateFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-lg min-h-[400px]">
      <PackageOpen className="w-16 h-16 text-gray-500 mb-4" />
      
      <h2 className="text-xl font-semibold text-gray-300 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        {message}
      </p>
      
      {showRetry && (
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      )}
    </div>
  );
}

export default EmptyStateFallback;
