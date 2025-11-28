/**
 * @author 구희원
 * @description 재사용 가능한 버튼 컴포넌트
 *
 * - 텍스트와 disabled 상태를 받아 버튼 생성
 * - Tailwind CSS를 활용한 스타일링
 * - 기본 type="submit"
 */

interface ButtonProps {
  /** 버튼에 표시될 텍스트 */
  text: string;

  /** 버튼 활성화 여부 (기본값: false) */
  disabled?: boolean;
}

/**
 * 버튼 컴포넌트
 *
 * @param {ButtonProps} props - 버튼 속성
 * @returns {JSX.Element} 스타일이 적용된 버튼 요소
 *
 * @example
 * <Button text="생성" disabled={false} />
 */
function Button({ text, disabled }: ButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-create flex py-4 px-2.5 justify-center items-center gap-2.5 self-stretch"
    >
      {text}
    </button>
  );
}

export default Button;
