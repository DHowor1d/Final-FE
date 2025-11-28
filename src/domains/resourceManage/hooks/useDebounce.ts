/**
 * @author 최산하
 */
import { useState, useEffect } from "react";

/**
 * 값이 변경된 후 일정 시간이 지나면 업데이트된 값을 반환하는 Debounce 훅
 * @param value 지연시킬 값
 * @param delay 지연 시간 (밀리초)
 * @returns 지연 처리된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 디바운스된 값을 저장할 상태
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // value가 변경되면 delay 이후에 debouncedValue를 업데이트하는 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup 함수: effect가 다시 실행되기 전 또는 컴포넌트 언마운트 시
    // 이전 타이머를 취소하여 불필요한 업데이트 방지
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value 또는 delay가 변경될 때만 effect 재실행

  // 최종적으로 디바운스된 값 반환
  return debouncedValue;
}
