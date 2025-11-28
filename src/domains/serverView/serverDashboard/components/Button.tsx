/**
 * @author 구희원
 * @description 아이콘 버튼 컴포넌트
 */

/**
 * 버튼 props
 */
interface ButtonProps {
  onClick: () => void;
  icon: string;
  title: string;
  editMode: boolean;
  disabled?: boolean;
}

/**
 * 아이콘 버튼
 * @param {ButtonProps} props - 버튼 속성
 * @param {() => void} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.icon - 아이콘 이미지 경로
 * @param {string} props.title - 버튼 제목 (툴팁)
 * @param {boolean} props.editMode - 편집 모드 여부
 * @param {boolean} props.disabled - 비활성화 여부
 * @returns 아이콘 버튼 컴포넌트
 */
function Button({ onClick, icon, title, editMode, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 bg-white/5 border border-slate-300/40 rounded-lg hover:bg-white/10 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white/10 cursor-pointer"
      } ${editMode ? "animate-slideInRight" : "animate-slideOutRight"}`}
      style={{ display: editMode ? "block" : "none" }}
      title={title}
    >
      <img src={icon} alt={title} className="w-4 h-4" />
    </button>
  );
}

export default Button;
