/**
 * @author 구희원
 * @description 랙 헤더 컴포넌트
 */

/**
 * 랙 헤더 props
 */
interface RackHeaderProps {
  rackName?: string;
  onClose?: () => void;
}

/**
 * 랙 헤더
 * @param {RackHeaderProps} props - 헤더 속성
 * @param {string} props.rackName - 랙 이름 (기본값: "N/A")
 * @param {() => void} props.onClose - 닫기 버튼 클릭 핸들러
 * @returns 랙 헤더 컴포넌트
 */
function RackHeader({ rackName = "N/A", onClose }: RackHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <h2 className="text-xl font-semibold">{rackName}</h2>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close rack view"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default RackHeader;
