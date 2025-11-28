/**
 * @author 구희원
 * @description 버튼 플레이스홀더 컴포넌트 (초기화, 저장, 편집 토글)
 */

import ResetIcon from "../assets/reset.svg";
import CheckIcon from "../assets/check.svg";
import Button from "./Button";

/**
 * 버튼 플레이스홀더 props
 */
interface ButtonPlaceholderProps {
  editMode: boolean;
  onReset: () => void;
  onSave: () => void;
  onToggleEdit: () => void;
  isLoading?: boolean;
}

/**
 * 버튼 플레이스홀더
 * @param {ButtonPlaceholderProps} props - 버튼 플레이스홀더 속성
 * @param {boolean} props.editMode - 편집 모드 여부
 * @param {() => void} props.onReset - 초기화 핸들러
 * @param {() => void} props.onSave - 저장 핸들러
 * @param {() => void} props.onToggleEdit - 편집 모드 토글 핸들러
 * @param {boolean} props.isLoading - 로딩 상태
 * @returns 버튼 플레이스홀더 컴포넌트
 */
function ButtonPlaceholder({
  editMode,
  onReset,
  onSave,
  onToggleEdit,
  isLoading = false,
}: ButtonPlaceholderProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <Button
        onClick={onReset}
        icon={ResetIcon}
        title="초기화"
        editMode={editMode}
        disabled={isLoading}
      />

      <Button
        onClick={onSave}
        icon={CheckIcon}
        title={isLoading ? "저장중..." : "저장"}
        editMode={editMode}
        disabled={isLoading}
      />

      <div
        onClick={onToggleEdit}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
          editMode
            ? "bg-white/5 border border-slate-300/40"
            : "bg-[#2A2D34]/50 border border-slate-300/40"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="text-xs text-slate-200 font-medium">
          {editMode ? "편집중" : "편집"}
        </span>
      </div>
    </div>
  );
}

export default ButtonPlaceholder;
