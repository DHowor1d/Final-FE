import { TriangleAlert, RefreshCw } from 'lucide-react';

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
  // error, 
  resetError, 
  title = '오류가 발생했습니다',
  message = '일시적인 문제가 발생했습니다. 다시 시도해 주세요.'
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg">
      <TriangleAlert className="w-10 h-10 text-red-500 mb-4" />
      
      <h2 className="text-xl font-semibold text-gray-50 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-50 text-center mb-4">
        {message}
      </p>
      
      {/* {import.meta.env.DEV && error && (
        <details className="w-full mb-4">
          <summary className="cursor-pointer text-sm text-red-950 hover:text-red-300">
            상세 오류 정보
          </summary>
          <div className="mt-2 p-3 bg-neutral-900 rounded text-sm text-red-400 overflow-auto max-h-32">
            <div className="font-semibold">Error:</div>
            <div className="mb-2">{error.toString()}</div>
            <div className="font-semibold">Stack Trace:</div>
            <pre className="whitespace-pre-wrap text-xs">
              {error.stack}
            </pre>
          </div>
        </details>
      )} */}
      
      <button
        onClick={handleRetry}
        className="flex flex-col items-center gap-2 px-4 py-2 text-yellow-400 hover:rotate-180 transition-all duration-300"
      >
        <RefreshCw className="w-8 h-8" />
      </button>
      <span className='text-gray-50 font-semibold'>다시 시도</span>
    </div>
  );
}

export default ErrorFallback;
