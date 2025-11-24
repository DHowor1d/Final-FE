import { PackageOpen, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

/**
 * 에러 Fallback UI 컴포넌트
 * 에러 발생 시 사용자에게 표시되는 UI
 */
function ErrorFallback({ 
  error, 
  resetError, 
  title,
  message
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  // 에러 메시지에서 데이터 없음 관련 키워드 확인
  const isNoDataError = error?.message?.includes('배치된 장비가 없거나') || 
                        error?.message?.includes('데이터를 받을 수 없습니다');

  const displayTitle = title || (isNoDataError ? '배치된 장비가 없습니다' : '오류가 발생했습니다');
  const displayMessage = message || error?.message || '일시적인 문제가 발생했습니다. 다시 시도해 주세요.';

  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-lg min-h-[400px]">
      <PackageOpen className="w-16 h-16 text-gray-500 mb-4" />
      
      <h2 className="text-xl font-semibold text-gray-300 mb-2">
        {displayTitle}
      </h2>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        {displayMessage}
      </p>
      
      {import.meta.env.DEV && error && !isNoDataError && (
        <details className="w-full mb-4 max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 text-center">
            상세 오류 정보
          </summary>
          <div className="mt-2 p-3 bg-neutral-800 rounded text-sm text-red-400 overflow-auto max-h-32 border border-neutral-700">
            <div className="font-semibold">Error:</div>
            <div className="mb-2">{error.toString()}</div>
            {error.stack && (
              <>
                <div className="font-semibold">Stack Trace:</div>
                <pre className="whitespace-pre-wrap text-xs">
                  {error.stack}
                </pre>
              </>
            )}
          </div>
        </details>
      )}
      
      <button
        onClick={handleRetry}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-300 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        새로고침
      </button>
    </div>
  );
}

export default ErrorFallback;
