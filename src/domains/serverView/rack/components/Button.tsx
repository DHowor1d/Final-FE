/**
 * @author 구희원
 * @description 뷰 전환 토글 버튼 컴포넌트
 */

/**
 * 뷰 토글 버튼 props
 */
interface ViewToggleButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
}

/**
 * 뷰 토글 버튼
 * @param {ViewToggleButtonProps} props - 버튼 속성
 * @param {string} props.label - 버튼 라벨
 * @param {() => void} props.onClick - 클릭 이벤트 핸들러
 * @param {boolean} props.active - 활성화 상태 (기본값: false)
 * @returns 토글 버튼 컴포넌트
 */
function Button({ label, onClick, active = false }: ViewToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 
        rounded-lg
        border
        transition-all duration-200
        text-xs font-medium
        ${
          active
            ? "bg-slate-500 border-slate-400 text-white"
            : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500 hover:text-white"
        }
      `}
      title={label}
    >
      {label}
    </button>
  );
}

export default Button;
