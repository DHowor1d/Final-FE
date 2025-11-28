/**
 * @author 구희원
 * @description 재사용 가능한 Input 컴포넌트
 *
 * - 라벨, 아이콘, 에러 메시지, disabled 상태 등을 지원
 * - Tailwind 또는 커스텀 CSS(input.css)로 스타일링
 * - 외부에서 상태(value)와 onChange 핸들러를 받아 제어 컴포넌트로 사용
 */

import "../css/input.css";

interface InputProps {
  /** 입력 필드 placeholder */
  placeholder: string;

  /** 입력 타입 (기본값: text) */
  type?: string;

  /** 입력 값 */
  value: string;

  /** 입력 필드 라벨 */
  label: string;

  /** 입력 필드 id */
  id: string;

  /** 값 변경 시 호출되는 핸들러 */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** 에러 메시지 */
  error?: string;

  /** 입력 필드 앞에 표시할 아이콘 */
  icon: React.ReactNode;

  /** 입력 필드 비활성화 여부 */
  disabled?: boolean;
}

/**
 * Input 컴포넌트
 *
 * @param {InputProps} props - Input 속성
 * @returns {JSX.Element} 라벨, 아이콘, 에러 메시지가 포함된 입력 필드
 *
 * @example
 * <Input
 *   id="username"
 *   label="사용자 이름"
 *   placeholder="이름을 입력하세요"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 *   icon={<UserIcon />}
 *   error={usernameError}
 * />
 */
function Input({
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
  id,
  label,
  error,
  disabled,
}: InputProps) {
  return (
    <div className="input-container">
      <label htmlFor={id} className="text-body-primary">
        {label}
      </label>
      <div className="input-wrapper">
        <div className="input-icon">{icon}</div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field"
        />
      </div>
      <div className="input-error-container">
        <div className="input-error">{error || ""}</div>
      </div>
    </div>
  );
}

export default Input;
